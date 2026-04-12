import type { User } from "@supabase/supabase-js";
import { CrmLead, CrmLeadTaskOverview, CrmOwnerOption, PipelineStage } from "@/types/crm";

export const PIPELINE_STAGE_ORDER: PipelineStage[] = [
  "novo",
  "em_contato",
  "qualificado",
  "ganho",
  "perdido",
];

export const PIPELINE_STAGE_OPTIONS: Array<{
  value: PipelineStage;
  label: string;
  description: string;
}> = [
  { value: "novo", label: "Novo", description: "Lead recem-capturado aguardando primeiro contato." },
  { value: "em_contato", label: "Em contato", description: "Lead em abordagem ou follow-up ativo." },
  { value: "qualificado", label: "Qualificado", description: "Lead com fit validado e proxima etapa comercial definida." },
  { value: "ganho", label: "Ganho", description: "Oportunidade convertida em negocio." },
  { value: "perdido", label: "Perdido", description: "Lead encerrado sem avancar no funil." },
];

export type LeadStageFilter = "all" | PipelineStage | "without_stage";
export type LeadsViewMode = "list" | "kanban";

export const LEAD_OWNER_FILTER_ALL = "all";
export const LEAD_OWNER_FILTER_MINE = "mine";
export const LEAD_OWNER_FILTER_UNASSIGNED = "unassigned";
export const LEAD_OWNER_FILTER_PREFIX = "owner:";

export type LeadOwnerFilter =
  | typeof LEAD_OWNER_FILTER_ALL
  | typeof LEAD_OWNER_FILTER_MINE
  | typeof LEAD_OWNER_FILTER_UNASSIGNED
  | `${typeof LEAD_OWNER_FILTER_PREFIX}${string}`;

export interface LeadTaskStatusSummary {
  openCount: number;
  overdueCount: number;
  nextTask: CrmLeadTaskOverview | null;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  ganho: "Ganho",
  perdido: "Perdido",
};

const STAGE_BADGE_STYLES: Record<PipelineStage | "without_stage", string> = {
  novo: "border-primary/20 bg-primary/10 text-primary",
  em_contato: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  qualificado: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ganho: "border-secondary/20 bg-secondary/10 text-secondary",
  perdido: "border-destructive/20 bg-destructive/10 text-destructive",
  without_stage: "border-border bg-muted text-muted-foreground",
};

export function getLeadStageValue(lead: Pick<CrmLead, "pipeline_stage" | "status">): PipelineStage | "without_stage" {
  const rawValue = (lead.pipeline_stage || lead.status || "").trim().toLowerCase();

  if (rawValue === "novo" || rawValue === "em_contato" || rawValue === "qualificado" || rawValue === "ganho" || rawValue === "perdido") {
    return rawValue;
  }

  return "without_stage";
}

export function getLeadStageLabel(lead: Pick<CrmLead, "pipeline_stage" | "status">) {
  const stage = getLeadStageValue(lead);
  return stage === "without_stage" ? "Sem etapa" : STAGE_LABELS[stage];
}

export function getLeadStageBadgeClassName(lead: Pick<CrmLead, "pipeline_stage" | "status">) {
  return STAGE_BADGE_STYLES[getLeadStageValue(lead)];
}

export function getLeadStageOptionLabel(stage: PipelineStage) {
  return STAGE_LABELS[stage];
}

export function buildOwnerOptions(ownerIds: Iterable<string | null | undefined>, currentUser?: Pick<User, "id" | "email" | "user_metadata"> | null) {
  const options = new Map<string, CrmOwnerOption>();
  const currentUserLabel = getCurrentUserIdentityLabel(currentUser);

  if (currentUser?.id) {
    options.set(currentUser.id, {
      id: currentUser.id,
      displayLabel: "Voce",
      selectLabel: currentUserLabel ? `Voce (${currentUserLabel})` : "Voce",
    });
  }

  for (const ownerId of ownerIds) {
    if (!ownerId || options.has(ownerId)) {
      continue;
    }

    options.set(ownerId, {
      id: ownerId,
      displayLabel: `Responsavel ${ownerId.slice(0, 8)}`,
      selectLabel: `Responsavel ${ownerId.slice(0, 8)}`,
    });
  }

  return Array.from(options.values()).sort((left, right) => {
    if (currentUser?.id && left.id === currentUser.id) {
      return -1;
    }

    if (currentUser?.id && right.id === currentUser.id) {
      return 1;
    }

    return left.selectLabel.localeCompare(right.selectLabel, "pt-BR");
  });
}

export function buildOwnerLabelMap(ownerOptions: CrmOwnerOption[]) {
  return new Map(ownerOptions.map((option) => [option.id, option.displayLabel]));
}

export function getOwnerDisplayLabel(
  ownerId: string | null,
  currentUserId?: string,
  ownerLabelMap?: ReadonlyMap<string, string>,
) {
  if (!ownerId) {
    return "Sem responsavel";
  }

  const knownOwnerLabel = ownerLabelMap?.get(ownerId);

  if (knownOwnerLabel) {
    return knownOwnerLabel;
  }

  if (currentUserId && ownerId === currentUserId) {
    return "Voce";
  }

  return `Responsavel ${ownerId.slice(0, 8)}`;
}

export function getOwnerFilterValueForId(ownerId: string) {
  return `${LEAD_OWNER_FILTER_PREFIX}${ownerId}` as const;
}

export function matchesOwnerFilter(
  ownerId: string | null,
  filter: LeadOwnerFilter,
  currentUserId?: string,
) {
  if (filter === LEAD_OWNER_FILTER_ALL) {
    return true;
  }

  if (filter === LEAD_OWNER_FILTER_MINE) {
    return Boolean(currentUserId) && ownerId === currentUserId;
  }

  if (filter === LEAD_OWNER_FILTER_UNASSIGNED) {
    return !ownerId;
  }

  return ownerId === getOwnerIdFromFilter(filter);
}

export function getOwnerIdFromFilter(filter: LeadOwnerFilter) {
  return filter.startsWith(LEAD_OWNER_FILTER_PREFIX)
    ? filter.slice(LEAD_OWNER_FILTER_PREFIX.length)
    : null;
}

export function buildLeadTaskSummary(tasks: CrmLeadTaskOverview[]): LeadTaskStatusSummary {
  const openTasks = tasks.filter((task) => !task.completed);
  const now = Date.now();
  const overdueCount = openTasks.filter((task) => new Date(task.due_date).getTime() < now).length;
  const nextTask =
    [...openTasks].sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())[0] ?? null;

  return {
    openCount: openTasks.length,
    overdueCount,
    nextTask,
  };
}

export function formatTaskDueDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function getCurrentUserIdentityLabel(currentUser?: Pick<User, "email" | "user_metadata"> | null) {
  const metadata = currentUser?.user_metadata as Record<string, unknown> | undefined;
  const candidateValues = [
    metadata?.full_name,
    metadata?.name,
    metadata?.nome,
    currentUser?.email,
  ];

  for (const candidate of candidateValues) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}
