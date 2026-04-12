import type { User } from "@supabase/supabase-js";
import { CrmLead, CrmLeadTaskOverview, CrmOwnerOption, CrmSourceOption, PipelineStage } from "@/types/crm";

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
export type LeadPeriodFilter = "all" | "today" | "7d" | "30d" | "90d";
export type LeadSortOption = "priority" | "newest" | "oldest" | "next_follow_up" | "name_asc";
export type LeadPageSize = 10 | 25 | 50;

export const LEAD_OWNER_FILTER_ALL = "all";
export const LEAD_OWNER_FILTER_MINE = "mine";
export const LEAD_OWNER_FILTER_UNASSIGNED = "unassigned";
export const LEAD_OWNER_FILTER_PREFIX = "owner:";
export const LEAD_SOURCE_FILTER_ALL = "all";
export const LEAD_SOURCE_FILTER_WITHOUT_SOURCE = "without_source";
export const LEAD_SOURCE_FILTER_PREFIX = "source:";

export type LeadOwnerFilter =
  | typeof LEAD_OWNER_FILTER_ALL
  | typeof LEAD_OWNER_FILTER_MINE
  | typeof LEAD_OWNER_FILTER_UNASSIGNED
  | `${typeof LEAD_OWNER_FILTER_PREFIX}${string}`;

export type LeadSourceFilter =
  | typeof LEAD_SOURCE_FILTER_ALL
  | typeof LEAD_SOURCE_FILTER_WITHOUT_SOURCE
  | `${typeof LEAD_SOURCE_FILTER_PREFIX}${string}`;

export interface LeadTaskStatusSummary {
  openCount: number;
  overdueCount: number;
  nextTask: CrmLeadTaskOverview | null;
}

export interface LeadListFilters {
  searchTerm: string;
  stageFilter: LeadStageFilter;
  ownerFilter: LeadOwnerFilter;
  sourceFilter: LeadSourceFilter;
  periodFilter: LeadPeriodFilter;
}

export interface LeadOperationalPriority {
  label: string;
  helper: string;
  tone: "danger" | "warning" | "success" | "neutral" | "muted";
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

export function buildSourceOptions(leads: Iterable<Pick<CrmLead, "origem">>) {
  const options = new Map<string, CrmSourceOption>();

  for (const lead of leads) {
    const normalizedSource = normalizeSourceValue(lead.origem);

    if (!normalizedSource) {
      continue;
    }

    options.set(normalizedSource, {
      value: normalizedSource,
      label: getLeadSourceLabel(normalizedSource),
    });
  }

  return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
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

export function getLeadSourceLabel(source: string | null | undefined) {
  const normalizedSource = normalizeSourceValue(source);
  return normalizedSource ? toTitleCase(normalizedSource) : "Sem origem";
}

export function getLeadSourceFilterValue(source: string) {
  return `${LEAD_SOURCE_FILTER_PREFIX}${source}` as const;
}

export function matchesSourceFilter(source: string | null | undefined, filter: LeadSourceFilter) {
  if (filter === LEAD_SOURCE_FILTER_ALL) {
    return true;
  }

  const normalizedSource = normalizeSourceValue(source);

  if (filter === LEAD_SOURCE_FILTER_WITHOUT_SOURCE) {
    return !normalizedSource;
  }

  return normalizedSource === getSourceValueFromFilter(filter);
}

export function matchesLeadPeriod(createdAt: string, periodFilter: LeadPeriodFilter, referenceDate = new Date()) {
  if (periodFilter === "all") {
    return true;
  }

  const createdAtTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtTime)) {
    return false;
  }

  const start = new Date(referenceDate);

  if (periodFilter === "today") {
    start.setHours(0, 0, 0, 0);
    return createdAtTime >= start.getTime();
  }

  const windowInDays = periodFilter === "7d"
    ? 7
    : periodFilter === "30d"
      ? 30
      : 90;

  return createdAtTime >= referenceDate.getTime() - windowInDays * DAY_IN_MS;
}

export function matchesLeadSearch(
  lead: Pick<CrmLead, "nome" | "empresa" | "email" | "whatsapp">,
  searchTerm: string,
) {
  const normalizedTerm = normalizeSearchTerm(searchTerm);

  if (!normalizedTerm) {
    return true;
  }

  const digitTerm = normalizeDigits(searchTerm);
  const searchableFields = [lead.nome, lead.empresa, lead.email, lead.whatsapp]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (digitTerm) {
    const phoneDigits = normalizeDigits(lead.whatsapp);

    if (phoneDigits.includes(digitTerm)) {
      return true;
    }
  }

  return searchableFields.some((field) => normalizeSearchTerm(field).includes(normalizedTerm));
}

export function filterLeadRows<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(
  rows: T[],
  filters: LeadListFilters,
  currentUserId?: string,
) {
  return rows.filter(({ lead }) => {
    const matchesStage = filters.stageFilter === "all"
      ? true
      : filters.stageFilter === "without_stage"
        ? getLeadStageValue(lead) === "without_stage"
        : getLeadStageValue(lead) === filters.stageFilter;

    return matchesStage
      && matchesOwnerFilter(lead.owner_id, filters.ownerFilter, currentUserId)
      && matchesSourceFilter(lead.origem, filters.sourceFilter)
      && matchesLeadPeriod(lead.created_at, filters.periodFilter)
      && matchesLeadSearch(lead, filters.searchTerm);
  });
}

export function sortLeadRows<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(
  rows: T[],
  sortOption: LeadSortOption,
) {
  return [...rows].sort((left, right) => {
    switch (sortOption) {
      case "newest":
        return compareDates(right.lead.created_at, left.lead.created_at);
      case "oldest":
        return compareDates(left.lead.created_at, right.lead.created_at);
      case "next_follow_up":
        return compareNextTask(left.taskSummary, right.taskSummary) || comparePriority(left, right);
      case "name_asc":
        return left.lead.nome.localeCompare(right.lead.nome, "pt-BR") || comparePriority(left, right);
      case "priority":
      default:
        return comparePriority(left, right);
    }
  });
}

export function paginateCollection<T>(items: T[], page: number, pageSize: number) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    currentPage,
    pageSize: safePageSize,
    totalItems: items.length,
    totalPages,
    startIndex,
    endIndex: Math.min(endIndex, items.length),
    items: items.slice(startIndex, endIndex),
  };
}

export function getLeadOperationalPriority(
  row: { lead: Pick<CrmLead, "owner_id" | "pipeline_stage" | "status">; taskSummary: LeadTaskStatusSummary },
): LeadOperationalPriority {
  const stageValue = getLeadStageValue(row.lead);

  if (row.taskSummary.overdueCount > 0) {
    return {
      label: "Acao imediata",
      helper: `${row.taskSummary.overdueCount} follow-ups vencidos.`,
      tone: "danger",
    };
  }

  if (!row.lead.owner_id) {
    return {
      label: "Distribuir owner",
      helper: "Lead ainda sem responsavel definido.",
      tone: "warning",
    };
  }

  if (stageValue === "without_stage") {
    return {
      label: "Classificar etapa",
      helper: "Lead precisa entrar formalmente no pipeline.",
      tone: "warning",
    };
  }

  if (!row.taskSummary.nextTask && stageValue !== "ganho" && stageValue !== "perdido") {
    return {
      label: "Definir proxima acao",
      helper: "Nao ha follow-up aberto no momento.",
      tone: "warning",
    };
  }

  if (stageValue === "ganho") {
    return {
      label: "Negocio ganho",
      helper: "Lead convertido com sucesso.",
      tone: "success",
    };
  }

  if (stageValue === "perdido") {
    return {
      label: "Encerrado",
      helper: "Oportunidade perdida no funil.",
      tone: "muted",
    };
  }

  return {
    label: "Em andamento",
    helper: row.taskSummary.nextTask ? "Lead com fluxo comercial ativo." : "Lead com ownership definido.",
    tone: "neutral",
  };
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

function getSourceValueFromFilter(filter: LeadSourceFilter) {
  return filter.startsWith(LEAD_SOURCE_FILTER_PREFIX)
    ? filter.slice(LEAD_SOURCE_FILTER_PREFIX.length)
    : null;
}

function normalizeSourceValue(source: string | null | undefined) {
  const normalizedSource = (source || "").trim().toLowerCase();
  return normalizedSource || "";
}

function normalizeSearchTerm(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function normalizeDigits(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}

function comparePriority<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(left: T, right: T) {
  const leftPriority = getPriorityRank(left);
  const rightPriority = getPriorityRank(right);

  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  const nextTaskComparison = compareNextTask(left.taskSummary, right.taskSummary);

  if (nextTaskComparison !== 0) {
    return nextTaskComparison;
  }

  return compareDates(right.lead.created_at, left.lead.created_at);
}

function compareNextTask(left: LeadTaskStatusSummary, right: LeadTaskStatusSummary) {
  const leftNextTaskTime = left.nextTask ? new Date(left.nextTask.due_date).getTime() : Number.POSITIVE_INFINITY;
  const rightNextTaskTime = right.nextTask ? new Date(right.nextTask.due_date).getTime() : Number.POSITIVE_INFINITY;

  if (leftNextTaskTime !== rightNextTaskTime) {
    return leftNextTaskTime - rightNextTaskTime;
  }

  return right.overdueCount - left.overdueCount;
}

function compareDates(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime();
}

function getPriorityRank(row: { lead: Pick<CrmLead, "owner_id" | "pipeline_stage" | "status">; taskSummary: LeadTaskStatusSummary }) {
  const stageValue = getLeadStageValue(row.lead);
  const isClosedStage = stageValue === "ganho" || stageValue === "perdido";

  let rank = 0;

  if (row.taskSummary.overdueCount > 0) {
    rank += 100;
  }

  if (!row.lead.owner_id) {
    rank += 30;
  }

  if (stageValue === "without_stage") {
    rank += 20;
  }

  if (!row.taskSummary.nextTask && !isClosedStage) {
    rank += 10;
  }

  if (isClosedStage) {
    rank -= 25;
  }

  return rank;
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
