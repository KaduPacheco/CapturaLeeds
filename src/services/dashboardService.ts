import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { AnalyticsEventName, AnalyticsEventRecord } from "@/types/analytics";
import { CrmLead, CrmLeadEvent, CrmLeadTask } from "@/types/crm";
import {
  DashboardActivityItem,
  DashboardAttentionData,
  DashboardChartDatum,
  DashboardKpi,
  DashboardPeriodOption,
  DashboardPeriodPoint,
  DashboardPeriodValue,
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
type DashboardAnalyticsRecord = Pick<
  AnalyticsEventRecord,
  | "event_name"
  | "visitor_id"
  | "session_id"
  | "page_path"
  | "referrer"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "occurred_at"
>;

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
const ANALYTICS_CONVERSION_EVENT: AnalyticsEventName = "lead_form_submit_success";
export const ANALYTICS_MIGRATION_FILE = "05_analytics_events.sql";

export const DASHBOARD_PERIOD_OPTIONS: DashboardPeriodOption[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "90 dias", days: 90 },
];

export async function getDashboardLeadsDataset(): Promise<DashboardLeadRecord[]> {
  assertSupabaseConfigured();

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
  assertSupabaseConfigured();

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
  assertSupabaseConfigured();

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

export async function getDashboardAnalyticsDataset(period: DashboardPeriodValue): Promise<DashboardAnalyticsRecord[]> {
  assertSupabaseConfigured();

  const periodOption = getDashboardPeriodOption(period);
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name,visitor_id,session_id,page_path,referrer,utm_source,utm_medium,utm_campaign,occurred_at")
    .gte("occurred_at", getPeriodStartDate(periodOption.days).toISOString())
    .in("event_name", ["page_view", ANALYTICS_CONVERSION_EVENT])
    .order("occurred_at", { ascending: true });

  if (error) {
    throw new Error(getAnalyticsErrorMessage(error.message));
  }

  return (data ?? []) as DashboardAnalyticsRecord[];
}

export function isAnalyticsUnavailableErrorMessage(message?: string | null) {
  if (!message) {
    return false;
  }

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("analytics_events")
    || normalizedMessage.includes(ANALYTICS_MIGRATION_FILE.toLowerCase())
    || normalizedMessage.includes("could not find the table")
    || normalizedMessage.includes("relation")
    || normalizedMessage.includes("schema cache")
    || normalizedMessage.includes("permission denied")
  );
}

export function buildLeadKpis(leads: DashboardLeadRecord[], period: DashboardPeriodValue): DashboardKpi[] {
  const periodOption = getDashboardPeriodOption(period);
  const periodStart = getPeriodStartDate(periodOption.days).getTime();
  const newLeads = leads.filter((lead) => new Date(lead.created_at).getTime() >= periodStart).length;

  return [
    {
      id: "total_leads",
      label: "Total de leads",
      value: leads.length,
      description: "Base total visivel pela sessao autenticada.",
      helperText: "Visao consolidada do CRM.",
      tone: "neutral",
    },
    {
      id: "new_leads",
      label: `Novos em ${periodOption.label}`,
      value: newLeads,
      description: "Entradas recentes capturadas no periodo selecionado.",
      helperText: "Ritmo de aquisicao comercial.",
      tone: newLeads > 0 ? "positive" : "neutral",
    },
  ];
}

export function buildTaskKpis(tasks: DashboardTaskRecord[]): DashboardKpi[] {
  const now = Date.now();
  const openTasks = tasks.filter((task) => !task.completed).length;
  const overdueTasks = tasks.filter((task) => !task.completed && new Date(task.due_date).getTime() < now).length;

  return [
    {
      id: "open_tasks",
      label: "Tarefas abertas",
      value: openTasks,
      description: "Follow-ups ainda pendentes de execucao.",
      helperText: "Agenda total em aberto.",
      tone: openTasks > 0 ? "warning" : "neutral",
    },
    {
      id: "overdue_tasks",
      label: "Tarefas atrasadas",
      value: overdueTasks,
      description: "Itens vencidos que precisam de atencao imediata.",
      helperText: overdueTasks > 0 ? "Prioridade operacional alta." : "Agenda sob controle.",
      tone: overdueTasks > 0 ? "danger" : "positive",
    },
  ];
}

export function buildAnalyticsKpis(
  analyticsEvents: DashboardAnalyticsRecord[],
  period: DashboardPeriodValue,
): DashboardKpi[] {
  const periodOption = getDashboardPeriodOption(period);
  const pageViews = analyticsEvents.filter((event) => event.event_name === "page_view");
  const successes = analyticsEvents.filter((event) => event.event_name === ANALYTICS_CONVERSION_EVENT);
  const uniqueVisitors = new Set(pageViews.map((event) => event.visitor_id)).size;
  const convertingVisitors = new Set(successes.map((event) => event.visitor_id)).size;
  const conversionRate = uniqueVisitors > 0 ? (convertingVisitors / uniqueVisitors) * 100 : 0;

  return [
    {
      id: "period_visitors",
      label: `Visitantes em ${periodOption.label}`,
      value: uniqueVisitors,
      description: "Visitantes unicos medidos por visitor_id no periodo selecionado.",
      helperText: `${pageViews.length} page views registradas`,
      tone: uniqueVisitors > 0 ? "neutral" : "warning",
    },
    {
      id: "conversion_rate",
      label: "Taxa de conversao",
      value: conversionRate,
      valueDisplay: `${conversionRate.toFixed(1)}%`,
      description: "Visitantes unicos com evento de sucesso sobre os visitantes com page view.",
      helperText: `${convertingVisitors} visitantes converteram`,
      tone: conversionRate >= 10 ? "positive" : conversionRate > 0 ? "warning" : "neutral",
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

export function buildPerformanceSeries(
  analyticsEvents: DashboardAnalyticsRecord[],
  leads: DashboardLeadRecord[],
  period: DashboardPeriodValue,
): DashboardPeriodPoint[] {
  const periodOption = getDashboardPeriodOption(period);
  const buckets = createPeriodBuckets(periodOption.days);
  const pageViews = analyticsEvents.filter((event) => event.event_name === "page_view");
  const successes = analyticsEvents.filter((event) => event.event_name === ANALYTICS_CONVERSION_EVENT);

  pageViews.forEach((event) => {
    const bucket = buckets.get(toBucketKey(event.occurred_at));
    if (!bucket) {
      return;
    }
    bucket.visitorIds.add(event.visitor_id);
  });

  successes.forEach((event) => {
    const bucket = buckets.get(toBucketKey(event.occurred_at));
    if (!bucket) {
      return;
    }
    bucket.conversionVisitorIds.add(event.visitor_id);
  });

  leads.forEach((lead) => {
    const bucket = buckets.get(toBucketKey(lead.created_at));
    if (!bucket) {
      return;
    }
    bucket.leads += 1;
  });

  return Array.from(buckets.values()).map((bucket) => {
    const visitors = bucket.visitorIds.size;
    const conversions = bucket.conversionVisitorIds.size;
    return {
      date: bucket.date,
      label: formatDateLabel(bucket.date),
      visitors,
      leads: bucket.leads,
      conversions,
      conversionRate: visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : 0,
    };
  });
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

function getDashboardPeriodOption(period: DashboardPeriodValue) {
  return DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === period) ?? DASHBOARD_PERIOD_OPTIONS[1];
}

function getPeriodStartDate(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));
  return date;
}

function createPeriodBuckets(days: number) {
  const startDate = getPeriodStartDate(days);
  const buckets = new Map<
    string,
    {
      date: string;
      leads: number;
      visitorIds: Set<string>;
      conversionVisitorIds: Set<string>;
    }
  >();

  for (let index = 0; index < days; index += 1) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    const key = currentDate.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      leads: 0,
      visitorIds: new Set<string>(),
      conversionVisitorIds: new Set<string>(),
    });
  }

  return buckets;
}

function toBucketKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00`));
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
      return "Ownership atualizado";
    case "cadence_task_created":
      return "Cadencia automatica";
    case "automation_webhook_dispatched":
      return "Webhook disparado";
    case "automation_webhook_failed":
      return "Falha de automacao";
    default:
      return toTitleCase(eventType);
  }
}

function getEventDescription(event: DashboardEventRecord) {
  const taskTitle = getPayloadString(event.payload, "title");
  const contentPreview = getPayloadString(event.payload, "content_preview");
  const nextStatus = getPayloadString(event.payload, "next_stage") || getPayloadString(event.payload, "to");
  const nextOwner = getPayloadString(event.payload, "next_owner_id");

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
    case "pipeline_change":
      return nextStatus ? `Novo estado registrado: ${toTitleCase(nextStatus)}` : "Houve atualizacao no status comercial.";
    case "owner_changed":
      return nextOwner ? `Lead atribuido ao responsavel ${nextOwner.slice(0, 8)}.` : "O ownership do lead foi ajustado.";
    case "cadence_task_created":
      return taskTitle ? `A cadencia criou a tarefa: ${taskTitle}` : "Uma tarefa automatica foi criada para manter o follow-up.";
    case "automation_webhook_dispatched":
      return "O CRM notificou a automacao externa mantendo a cadencia local como fonte principal.";
    case "automation_webhook_failed":
      return "A notificacao externa falhou, mas a operacao local do CRM foi preservada.";
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

function getAnalyticsErrorMessage(message: string) {
  if (isAnalyticsUnavailableErrorMessage(message)) {
    return `A base de analytics ainda nao esta disponivel neste ambiente. Aplique a migration ${ANALYTICS_MIGRATION_FILE} para habilitar visitantes e conversao.`;
  }

  return `Falha ao carregar analytics do dashboard: ${message}`;
}

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
