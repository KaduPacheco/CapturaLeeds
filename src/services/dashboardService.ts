import { supabase } from "@/lib/supabase";
import { CrmLead, CrmLeadEvent, CrmLeadTask } from "@/types/crm";
import {
  DashboardActivityItem,
  DashboardAttentionData,
  DashboardChartDatum,
  DashboardKpi,
  DashboardRecentLeadItem,
  DashboardUpcomingTaskItem,
} from "@/types/dashboard";

type DashboardLeadRecord = Pick<
  CrmLead,
  | "id"
  | "nome"
  | "empresa"
  | "origem"
  | "status"
  | "pipeline_stage"
  | "owner_id"
  | "whatsapp"
  | "email"
  | "created_at"
  | "updated_at"
>;

type DashboardTaskRecord = Pick<
  CrmLeadTask,
  "id" | "lead_id" | "assignee_id" | "title" | "due_date" | "completed" | "created_at" | "updated_at"
>;

type DashboardEventRecord = Pick<CrmLeadEvent, "id" | "lead_id" | "event_type" | "payload" | "created_at">;

const PIPELINE_COLORS: Record<string, string> = {
  novo: "#2563eb",
  em_contato: "#f59e0b",
  qualificado: "#0f766e",
  ganho: "#16a34a",
  perdido: "#dc2626",
  sem_estagio: "#94a3b8",
};

const SOURCE_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#dc2626", "#0891b2", "#64748b"];

const PIPELINE_ORDER = ["novo", "em_contato", "qualificado", "ganho", "perdido", "sem_estagio"];

export async function getDashboardLeadsDataset(): Promise<DashboardLeadRecord[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id,nome,empresa,origem,status,pipeline_stage,owner_id,whatsapp,email,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao carregar leads do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardLeadRecord[];
}

export async function getDashboardTasksDataset(): Promise<DashboardTaskRecord[]> {
  const { data, error } = await supabase
    .from("lead_tasks")
    .select("id,lead_id,assignee_id,title,due_date,completed,created_at,updated_at")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar tarefas do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardTaskRecord[];
}

export async function getDashboardEventsDataset(limit = 10): Promise<DashboardEventRecord[]> {
  const { data, error } = await supabase
    .from("lead_events")
    .select("id,lead_id,event_type,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Falha ao carregar atividades do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardEventRecord[];
}

export function buildLeadKpis(leads: DashboardLeadRecord[]): DashboardKpi[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newLeads = leads.filter((lead) => new Date(lead.created_at).getTime() >= sevenDaysAgo.getTime()).length;

  return [
    {
      id: "total_leads",
      label: "Total de leads",
      value: leads.length,
      description: "Base total visivel pela sua sessao autenticada.",
      helperText: "Volume consolidado do funil atual.",
      tone: "neutral",
    },
    {
      id: "new_leads",
      label: "Novos em 7 dias",
      value: newLeads,
      description: "Entradas recentes vindas da operacao comercial.",
      helperText: "Janela movel dos ultimos 7 dias.",
      tone: newLeads > 0 ? "positive" : "neutral",
    },
  ];
}

export function buildTaskKpis(tasks: DashboardTaskRecord[]): DashboardKpi[] {
  const now = Date.now();
  const openTasks = tasks.filter((task) => !task.completed).length;
  const overdueTasks = tasks.filter(
    (task) => !task.completed && new Date(task.due_date).getTime() < now,
  ).length;

  return [
    {
      id: "open_tasks",
      label: "Tarefas abertas",
      value: openTasks,
      description: "Follow-ups ainda pendentes de execucao.",
      helperText: "Inclui toda a agenda em aberto.",
      tone: openTasks > 0 ? "warning" : "neutral",
    },
    {
      id: "overdue_tasks",
      label: "Tarefas atrasadas",
      value: overdueTasks,
      description: "Itens vencidos que precisam de atencao imediata.",
      helperText: overdueTasks > 0 ? "Prioridade operacional alta." : "Agenda dentro do prazo.",
      tone: overdueTasks > 0 ? "danger" : "positive",
    },
  ];
}

export function buildPipelineDistribution(leads: DashboardLeadRecord[]): DashboardChartDatum[] {
  const counts = new Map<string, number>();

  leads.forEach((lead) => {
    const stageKey = getLeadStageKey(lead);
    counts.set(stageKey, (counts.get(stageKey) ?? 0) + 1);
  });

  const total = leads.length || 1;

  return Array.from(counts.entries())
    .sort((a, b) => sortPipelineEntries(a[0], b[0]))
    .map(([stageKey, value]) => ({
      id: stageKey,
      label: getStageLabelFromKey(stageKey),
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
      color: PIPELINE_COLORS[stageKey] ?? PIPELINE_COLORS.sem_estagio,
    }));
}

export function buildSourceDistribution(leads: DashboardLeadRecord[]): DashboardChartDatum[] {
  const counts = new Map<string, number>();

  leads.forEach((lead) => {
    const source = getSourceLabel(lead.origem);
    counts.set(source, (counts.get(source) ?? 0) + 1);
  });

  const ordered = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const topSources = ordered.slice(0, 6);
  const remaining = ordered.slice(6);

  if (remaining.length > 0) {
    const othersTotal = remaining.reduce((sum, [, value]) => sum + value, 0);
    topSources.push(["Outros", othersTotal]);
  }

  const total = leads.length || 1;

  return topSources.map(([label, value], index) => ({
    id: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    value,
    percentage: Number(((value / total) * 100).toFixed(1)),
    color: SOURCE_COLORS[index % SOURCE_COLORS.length],
  }));
}

export function buildRecentLeads(leads: DashboardLeadRecord[], limit = 6): DashboardRecentLeadItem[] {
  return leads.slice(0, limit).map((lead) => ({
    id: lead.id,
    name: lead.nome || "Lead sem nome",
    company: lead.empresa,
    source: getSourceLabel(lead.origem),
    stageLabel: getLeadStageLabel(lead),
    whatsapp: lead.whatsapp,
    email: lead.email,
    createdAt: lead.created_at,
  }));
}

export function buildUpcomingTasks(
  tasks: DashboardTaskRecord[],
  leads: DashboardLeadRecord[] = [],
  limit = 6,
): DashboardUpcomingTaskItem[] {
  const leadMap = createLeadMap(leads);

  return tasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, limit)
    .map((task) => {
      const lead = leadMap.get(task.lead_id);

      return {
        id: task.id,
        leadId: task.lead_id,
        leadName: lead?.nome || "Lead sem identificacao",
        company: lead?.empresa ?? null,
        title: task.title,
        dueDate: task.due_date,
        overdue: isTaskOverdue(task),
        stageLabel: lead ? getLeadStageLabel(lead) : "Sem estagio",
      };
    });
}

export function buildActivityFeed(
  events: DashboardEventRecord[],
  leads: DashboardLeadRecord[] = [],
): DashboardActivityItem[] {
  const leadMap = createLeadMap(leads);

  return events.map((event) => {
    const lead = leadMap.get(event.lead_id);

    return {
      id: event.id,
      leadId: event.lead_id,
      leadName: lead?.nome || "Lead sem identificacao",
      company: lead?.empresa ?? null,
      eventType: event.event_type,
      title: getEventTitle(event.event_type),
      description: getEventDescription(event),
      occurredAt: event.created_at,
    };
  });
}

export function buildAttentionPanel(
  leads: DashboardLeadRecord[],
  tasks: DashboardTaskRecord[],
): DashboardAttentionData {
  const withoutOwner = leads.filter((lead) => !lead.owner_id).length;
  const withoutStage = leads.filter((lead) => getLeadStageKey(lead) === "sem_estagio").length;
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task));

  return {
    metrics: [
      {
        id: "without_owner",
        label: "Leads sem owner",
        count: withoutOwner,
        description: "Registros aguardando responsavel comercial.",
        tone: withoutOwner > 0 ? "warning" : "positive",
      },
      {
        id: "without_stage",
        label: "Leads sem estagio",
        count: withoutStage,
        description: "Itens que ainda nao entraram claramente no funil.",
        tone: withoutStage > 0 ? "warning" : "positive",
      },
      {
        id: "overdue_tasks",
        label: "Tarefas vencidas",
        count: overdueTasks.length,
        description: "Acoes pendentes que ja passaram do prazo.",
        tone: overdueTasks.length > 0 ? "danger" : "positive",
      },
    ],
    overdueTasksPreview: buildUpcomingTasks(overdueTasks, leads, 4),
  };
}

function createLeadMap(leads: DashboardLeadRecord[]) {
  return new Map(leads.map((lead) => [lead.id, lead]));
}

function isTaskOverdue(task: DashboardTaskRecord) {
  return !task.completed && new Date(task.due_date).getTime() < Date.now();
}

function getLeadStageKey(lead: Pick<DashboardLeadRecord, "pipeline_stage" | "status">) {
  const rawValue = (lead.pipeline_stage || lead.status || "").trim().toLowerCase();
  return rawValue || "sem_estagio";
}

function getLeadStageLabel(lead: Pick<DashboardLeadRecord, "pipeline_stage" | "status">) {
  return getStageLabelFromKey(getLeadStageKey(lead));
}

function getStageLabelFromKey(stageKey: string) {
  switch (stageKey) {
    case "novo":
      return "Novo";
    case "em_contato":
      return "Em contato";
    case "qualificado":
      return "Qualificado";
    case "ganho":
      return "Ganho";
    case "perdido":
      return "Perdido";
    default:
      return stageKey === "sem_estagio" ? "Sem estagio" : toTitleCase(stageKey);
  }
}

function getSourceLabel(source: string | null | undefined) {
  const normalized = (source || "").trim();
  return normalized || "Nao informado";
}

function getEventTitle(eventType: string) {
  switch (eventType) {
    case "lead_created":
      return "Lead capturado";
    case "note_added":
      return "Nota registrada";
    case "task_added":
      return "Follow-up agendado";
    case "task_completed":
      return "Tarefa concluida";
    case "task_reopened":
      return "Tarefa reaberta";
    case "status_change":
      return "Status atualizado";
    case "pipeline_change":
      return "Estagio atualizado";
    case "owner_changed":
      return "Ownership ajustado";
    default:
      return toTitleCase(eventType);
  }
}

function getEventDescription(event: DashboardEventRecord) {
  const taskTitle = getPayloadString(event.payload, "title");
  const contentPreview = getPayloadString(event.payload, "content_preview");
  const nextStatus = getPayloadString(event.payload, "to");
  const previousStage = getPayloadString(event.payload, "previous_stage");
  const nextStage = getPayloadString(event.payload, "next_stage");
  const previousOwnerLabel = getPayloadString(event.payload, "previous_owner_label");
  const nextOwnerLabel = getPayloadString(event.payload, "next_owner_label");
  const nextOwnerId = getPayloadString(event.payload, "next_owner_id");

  switch (event.event_type) {
    case "lead_created":
      return "Novo lead entrou no CRM e ja esta disponivel para acompanhamento.";
    case "note_added":
      return contentPreview ? `Resumo da nota: ${contentPreview}` : "Uma anotacao interna foi adicionada ao lead.";
    case "task_added":
      return taskTitle ? `Nova tarefa criada: ${taskTitle}` : "Uma nova tarefa foi criada para este lead.";
    case "task_completed":
      return taskTitle ? `Tarefa concluida: ${taskTitle}` : "Uma tarefa foi concluida.";
    case "task_reopened":
      return taskTitle ? `Tarefa reaberta: ${taskTitle}` : "Uma tarefa voltou para a fila de execucao.";
    case "status_change":
      return nextStatus ? `Novo estado registrado: ${toTitleCase(nextStatus)}` : "Houve atualizacao no status comercial.";
    case "pipeline_change":
      if (previousStage && nextStage) {
        return `${toTitleCase(previousStage)} -> ${toTitleCase(nextStage)}`;
      }

      if (nextStage) {
        return `Lead classificado em ${toTitleCase(nextStage)}.`;
      }

      return "Houve atualizacao no pipeline comercial.";
    case "owner_changed":
      if (previousOwnerLabel && nextOwnerLabel) {
        return `${previousOwnerLabel} -> ${nextOwnerLabel}`;
      }

      if (nextOwnerLabel) {
        return `Lead atribuido para ${nextOwnerLabel}.`;
      }

      if (nextOwnerId) {
        return `Lead atribuido para responsavel ${nextOwnerId.slice(0, 8)}.`;
      }

      return "Ownership atualizado para fila sem responsavel.";
    default:
      return "Atividade registrada automaticamente pelo CRM.";
  }
}

function getPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function sortPipelineEntries(a: string, b: string) {
  const aIndex = PIPELINE_ORDER.indexOf(a);
  const bIndex = PIPELINE_ORDER.indexOf(b);

  if (aIndex === -1 && bIndex === -1) {
    return a.localeCompare(b);
  }

  if (aIndex === -1) {
    return 1;
  }

  if (bIndex === -1) {
    return -1;
  }

  return aIndex - bIndex;
}

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
