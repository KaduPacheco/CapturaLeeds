import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { AnalyticsEventName, AnalyticsEventRecord } from "@/types/analytics";
import { CrmLead, CrmLeadEvent, CrmLeadTask } from "@/types/crm";
import {
  DashboardAcquisitionFunnel,
  DashboardActivityItem,
  DashboardAnalyticsSnapshot,
  DashboardAttentionData,
  DashboardAttributionModel,
  DashboardAttributionSourceRow,
  DashboardCampaignRow,
  DashboardCampaignSortMode,
  DashboardChartDatum,
  DashboardKpi,
  DashboardPeriodOption,
  DashboardPeriodPoint,
  DashboardPeriodValue,
  DashboardRecentLeadItem,
  DashboardTrafficLeadComparison,
  DashboardTrafficLeadInsight,
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
  | "page_url"
  | "referrer"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
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
const ANALYTICS_DASHBOARD_EVENT_NAMES: AnalyticsEventName[] = [
  "page_view",
  "cta_click",
  "lead_form_start",
  "lead_form_submit_attempt",
  ANALYTICS_CONVERSION_EVENT,
  "lead_form_submit_error",
];
export const ANALYTICS_MIGRATION_FILE = "05_analytics_events.sql";

export const DASHBOARD_PERIOD_OPTIONS: DashboardPeriodOption[] = [
  { value: "today", label: "Hoje", days: 1 },
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "90 dias", days: 90 },
];

interface DashboardAggregationOptions {
  now?: Date;
}

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

  const periodRange = getPeriodRange(period);
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name,visitor_id,session_id,page_path,page_url,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,occurred_at")
    .gte("occurred_at", periodRange.start.toISOString())
    .lt("occurred_at", periodRange.endExclusive.toISOString())
    .in("event_name", ANALYTICS_DASHBOARD_EVENT_NAMES)
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

export function buildLeadKpis(
  leads: DashboardLeadRecord[],
  period: DashboardPeriodValue,
  options?: DashboardAggregationOptions,
): DashboardKpi[] {
  const periodOption = getDashboardPeriodOption(period);
  const periodRange = getPeriodRange(period, options);
  const newLeads = leads.filter((lead) => isWithinPeriod(lead.created_at, periodRange)).length;

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
      label: period === "today" ? "Novos hoje" : `Novos em ${periodOption.label}`,
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
      label: period === "today" ? "Visitantes hoje" : `Visitantes em ${periodOption.label}`,
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
  options?: DashboardAggregationOptions,
): DashboardPeriodPoint[] {
  const buckets = createPeriodBuckets(period, options);
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

export function buildAttributionSourceRows(
  analyticsEvents: DashboardAnalyticsRecord[],
  limit = 8,
): DashboardAttributionSourceRow[] {
  const sourceMap = new Map<
    string,
    {
      sourceKey: string;
      sourceLabel: string;
      attributionModel: DashboardAttributionModel;
      detailLabel: string;
      visitorIds: Set<string>;
      conversionVisitorIds: Set<string>;
    }
  >();

  const pageViews = analyticsEvents.filter((event) => event.event_name === "page_view");
  const successes = analyticsEvents.filter((event) => event.event_name === ANALYTICS_CONVERSION_EVENT);
  const totalVisitors = new Set(pageViews.map((event) => event.visitor_id)).size;
  const totalConversions = new Set(successes.map((event) => event.visitor_id)).size;

  pageViews.forEach((event) => {
    const attribution = getNormalizedAttribution(event);
    const entry = getOrCreateSourceAggregate(sourceMap, attribution);
    entry.visitorIds.add(event.visitor_id);
  });

  successes.forEach((event) => {
    const attribution = getNormalizedAttribution(event);
    const entry = getOrCreateSourceAggregate(sourceMap, attribution);
    entry.conversionVisitorIds.add(event.visitor_id);
  });

  return Array.from(sourceMap.values())
    .map((entry) => {
      const visitors = entry.visitorIds.size;
      const conversions = entry.conversionVisitorIds.size;

      return {
        id: entry.sourceKey,
        sourceKey: entry.sourceKey,
        sourceLabel: entry.sourceLabel,
        attributionModel: entry.attributionModel,
        detailLabel: entry.detailLabel,
        visitors,
        conversions,
        conversionRate: visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : null,
        visitorsShare: totalVisitors > 0 ? Number(((visitors / totalVisitors) * 100).toFixed(1)) : 0,
        conversionsShare: totalConversions > 0 ? Number(((conversions / totalConversions) * 100).toFixed(1)) : 0,
      };
    })
    .sort(sortAttributionRows)
    .slice(0, limit);
}

export function buildCampaignRanking(
  analyticsEvents: DashboardAnalyticsRecord[],
  limit = 8,
): DashboardCampaignRow[] {
  const campaignMap = new Map<
    string,
    {
      campaignLabel: string;
      sourceLabel: string;
      mediumLabel: string;
      termLabel: string | null;
      contentLabel: string | null;
      attributionStatus: DashboardCampaignRow["attributionStatus"];
      attributionSummary: string;
      visitorIds: Set<string>;
      conversionVisitorIds: Set<string>;
    }
  >();

  const campaignEvents = analyticsEvents.filter(isCampaignRelevantEvent);

  campaignEvents.forEach((event) => {
    const source = getNormalizedAttribution(event);
    const campaign = getCampaignMetadata(event, source);
    const existing =
      campaignMap.get(campaign.id) ??
      {
        campaignLabel: campaign.campaignLabel,
        sourceLabel: campaign.sourceLabel,
        mediumLabel: campaign.mediumLabel,
        termLabel: campaign.termLabel,
        contentLabel: campaign.contentLabel,
        attributionStatus: campaign.attributionStatus,
        attributionSummary: campaign.attributionSummary,
        visitorIds: new Set<string>(),
        conversionVisitorIds: new Set<string>(),
      };

    if (event.event_name === "page_view") {
      existing.visitorIds.add(event.visitor_id);
    }

    if (event.event_name === ANALYTICS_CONVERSION_EVENT) {
      existing.conversionVisitorIds.add(event.visitor_id);
    }

    if (existing.termLabel && campaign.termLabel && existing.termLabel !== campaign.termLabel) {
      existing.termLabel = "Multiplos termos";
    } else if (!existing.termLabel) {
      existing.termLabel = campaign.termLabel;
    }

    if (existing.contentLabel && campaign.contentLabel && existing.contentLabel !== campaign.contentLabel) {
      existing.contentLabel = "Multiplos conteudos";
    } else if (!existing.contentLabel) {
      existing.contentLabel = campaign.contentLabel;
    }

    if (existing.attributionStatus !== "untagged" && campaign.attributionStatus === "untagged") {
      existing.attributionStatus = "partial";
      existing.attributionSummary = "Dados mistos de campanha e trafego sem UTM";
    } else if (existing.attributionStatus === "complete" && campaign.attributionStatus === "partial") {
      existing.attributionStatus = "partial";
      existing.attributionSummary = campaign.attributionSummary;
    }

    campaignMap.set(campaign.id, existing);
  });

  return Array.from(campaignMap.entries())
    .map(([id, entry]) => {
      const visitors = entry.visitorIds.size;
      const conversions = entry.conversionVisitorIds.size;

      return {
        id,
        campaignLabel: entry.campaignLabel,
        sourceLabel: entry.sourceLabel,
        mediumLabel: entry.mediumLabel,
        termLabel: entry.termLabel,
        contentLabel: entry.contentLabel,
        visitors,
        conversions,
        conversionRate: visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : null,
        attributionStatus: entry.attributionStatus,
        attributionSummary: entry.attributionSummary,
      };
    })
    .sort((left, right) => sortCampaignRows(left, right, "highest_conversion"))
    .slice(0, limit);
}

export function sortCampaignRanking(
  campaigns: DashboardCampaignRow[],
  sortMode: DashboardCampaignSortMode,
) {
  return [...campaigns].sort((left, right) => sortCampaignRows(left, right, sortMode));
}

export function buildAcquisitionFunnel(analyticsEvents: DashboardAnalyticsRecord[]): DashboardAcquisitionFunnel {
  const funnelDefinitions = [
    {
      id: "visitors" as const,
      label: "Visitantes",
      description: "Visitantes unicos com page_view no periodo.",
      eventName: "page_view" as AnalyticsEventName,
    },
    {
      id: "cta_clicks" as const,
      label: "Cliques em CTA",
      description: "Visitantes que clicaram em pelo menos um CTA da landing.",
      eventName: "cta_click" as AnalyticsEventName,
    },
    {
      id: "form_starts" as const,
      label: "Inicio de formulario",
      description: "Visitantes que interagiram com o formulario pela primeira vez.",
      eventName: "lead_form_start" as AnalyticsEventName,
    },
    {
      id: "submit_attempts" as const,
      label: "Tentativa de envio",
      description: "Visitantes que tentaram enviar o formulario.",
      eventName: "lead_form_submit_attempt" as AnalyticsEventName,
    },
    {
      id: "submit_successes" as const,
      label: "Envio com sucesso",
      description: "Visitantes com lead_form_submit_success no periodo.",
      eventName: ANALYTICS_CONVERSION_EVENT,
    },
  ];

  const stageVisitorIds = new Map<AnalyticsEventName, Set<string>>();

  funnelDefinitions.forEach((stage) => {
    stageVisitorIds.set(stage.eventName, new Set<string>());
  });

  analyticsEvents.forEach((event) => {
    const visitors = stageVisitorIds.get(event.event_name);

    if (visitors) {
      visitors.add(event.visitor_id);
    }
  });

  let hasPartialData = false;
  const stages = funnelDefinitions.map((stage, index) => {
    const count = stageVisitorIds.get(stage.eventName)?.size ?? 0;
    const previousStage = index > 0 ? funnelDefinitions[index - 1] : null;
    const previousCount = previousStage ? stageVisitorIds.get(previousStage.eventName)?.size ?? 0 : null;

    if (previousCount === null || previousCount === 0) {
      const isPartialStage = previousCount === 0 && count > 0;

      if (isPartialStage) {
        hasPartialData = true;
      }

      return {
        id: stage.id,
        label: stage.label,
        description: stage.description,
        count,
        advanceRate: previousCount === null ? null : isPartialStage ? null : 0,
        dropOffRate: previousCount === null ? null : isPartialStage ? null : 0,
        previousCount,
        hasPartialData: isPartialStage,
      };
    }

    if (count > previousCount) {
      hasPartialData = true;

      return {
        id: stage.id,
        label: stage.label,
        description: stage.description,
        count,
        advanceRate: null,
        dropOffRate: null,
        previousCount,
        hasPartialData: true,
      };
    }

    const advanceRate = Number(((count / previousCount) * 100).toFixed(1));
    const dropOffRate = Number((100 - advanceRate).toFixed(1));

    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      count,
      advanceRate,
      dropOffRate,
      previousCount,
      hasPartialData: false,
    };
  });

  const bottleneck = stages
    .filter((stage) => stage.dropOffRate !== null && stage.previousCount !== null)
    .sort((left, right) => (right.dropOffRate ?? 0) - (left.dropOffRate ?? 0))[0];

  const submitErrorCount = new Set(
    analyticsEvents
      .filter((event) => event.event_name === "lead_form_submit_error")
      .map((event) => event.visitor_id),
  ).size;

  return {
    stages,
    bottleneck: bottleneck && bottleneck.previousCount !== null
      ? {
          fromStageLabel: stages[stages.findIndex((stage) => stage.id === bottleneck.id) - 1]?.label ?? "Etapa anterior",
          toStageLabel: bottleneck.label,
          dropOffRate: bottleneck.dropOffRate ?? 0,
          dropOffCount: bottleneck.previousCount - bottleneck.count,
        }
      : null,
    submitErrorCount,
    hasPartialData,
  };
}

export function buildTrafficLeadComparison(data: DashboardPeriodPoint[]): DashboardTrafficLeadComparison {
  if (data.length === 0) {
    return {
      previous: createTrafficLeadSnapshot("Metade inicial", []),
      current: createTrafficLeadSnapshot("Metade final", []),
      delta: {
        visitorsPercent: null,
        leadsPercent: null,
        conversionRatePoints: null,
      },
      insights: [
        {
          id: "no_data",
          title: "Sem base comparativa",
          description: "Ainda nao ha dados suficientes no periodo para comparar trafego e geracao de leads.",
          tone: "neutral",
        },
      ],
      hasComparableWindow: false,
    };
  }

  const splitIndex = Math.max(1, Math.ceil(data.length / 2));
  const previousSlice = data.slice(0, splitIndex);
  const currentSlice = data.slice(splitIndex);

  const previous = createTrafficLeadSnapshot("Metade inicial", previousSlice);
  const current = createTrafficLeadSnapshot(currentSlice.length > 0 ? "Metade final" : "Janela atual", currentSlice.length > 0 ? currentSlice : data);
  const hasComparableWindow = currentSlice.length > 0;

  const delta = {
    visitorsPercent: calculatePercentDelta(previous.visitors, current.visitors),
    leadsPercent: calculatePercentDelta(previous.leads, current.leads),
    conversionRatePoints: hasComparableWindow
      ? Number((current.conversionRate - previous.conversionRate).toFixed(1))
      : null,
  };

  return {
    previous,
    current,
    delta,
    insights: buildTrafficLeadInsights(previous, current, delta, hasComparableWindow),
    hasComparableWindow,
  };
}

export function buildAnalyticsDashboardSnapshot(
  analyticsEvents: DashboardAnalyticsRecord[],
  leads: DashboardLeadRecord[],
  period: DashboardPeriodValue,
): DashboardAnalyticsSnapshot {
  const performance = buildPerformanceSeries(analyticsEvents, leads, period);

  return {
    kpis: buildAnalyticsKpis(analyticsEvents, period),
    performance,
    attributionSources: buildAttributionSourceRows(analyticsEvents),
    campaigns: buildCampaignRanking(analyticsEvents),
    funnel: buildAcquisitionFunnel(analyticsEvents),
    trafficLeadComparison: buildTrafficLeadComparison(performance),
  };
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

function getOrCreateSourceAggregate(
  sourceMap: Map<
    string,
    {
      sourceKey: string;
      sourceLabel: string;
      attributionModel: DashboardAttributionModel;
      detailLabel: string;
      visitorIds: Set<string>;
      conversionVisitorIds: Set<string>;
    }
  >,
  attribution: ReturnType<typeof getNormalizedAttribution>,
) {
  const existing =
    sourceMap.get(attribution.sourceKey) ??
    {
      sourceKey: attribution.sourceKey,
      sourceLabel: attribution.sourceLabel,
      attributionModel: attribution.attributionModel,
      detailLabel: attribution.detailLabel,
      visitorIds: new Set<string>(),
      conversionVisitorIds: new Set<string>(),
    };

  sourceMap.set(attribution.sourceKey, existing);
  return existing;
}

function hasCampaignSignal(event: DashboardAnalyticsRecord) {
  return Boolean(
    normalizeToken(event.utm_source)
    || normalizeToken(event.utm_medium)
    || normalizeToken(event.utm_campaign)
    || normalizeToken(event.utm_term)
    || normalizeToken(event.utm_content),
  );
}

function isCampaignRelevantEvent(event: DashboardAnalyticsRecord) {
  return event.event_name === "page_view" || event.event_name === ANALYTICS_CONVERSION_EVENT;
}

function getCampaignMetadata(
  event: DashboardAnalyticsRecord,
  source: ReturnType<typeof getNormalizedAttribution>,
) {
  const campaignLabel = getCampaignLabel(event.utm_campaign);
  const mediumLabel = getMediumLabel(event.utm_medium);
  const termLabel = getOptionalLabel(event.utm_term);
  const contentLabel = getOptionalLabel(event.utm_content);
  const campaignKey = normalizeToken(event.utm_campaign) || "sem_campanha";
  const mediumKey = normalizeToken(event.utm_medium) || "sem_medio";
  const signalPresent = hasCampaignSignal(event);
  const hasSource = Boolean(normalizeToken(event.utm_source));
  const hasMedium = Boolean(normalizeToken(event.utm_medium));
  const hasCampaign = Boolean(normalizeToken(event.utm_campaign));
  const attributionStatus = !signalPresent
    ? "untagged"
    : hasSource && hasMedium && hasCampaign
      ? "complete"
      : "partial";

  return {
    id: [source.sourceKey, mediumKey, campaignKey].join("::"),
    campaignLabel: signalPresent ? campaignLabel : "Sem UTM / campanha",
    sourceLabel: source.sourceLabel,
    mediumLabel,
    termLabel,
    contentLabel,
    attributionStatus,
    attributionSummary: getCampaignAttributionSummary(attributionStatus, {
      hasSource,
      hasMedium,
      hasCampaign,
    }),
  };
}

function getNormalizedAttribution(event: DashboardAnalyticsRecord) {
  const utmSource = normalizeToken(event.utm_source);

  if (utmSource) {
    const normalizedSource = normalizeSourceToken(utmSource);
    const mediumLabel = getOptionalLabel(event.utm_medium);

    return {
      sourceKey: normalizedSource.key,
      sourceLabel: normalizedSource.label,
      attributionModel: "utm" as const,
      detailLabel: mediumLabel ? `UTM ${mediumLabel}` : "UTM source",
    };
  }

  const referrerHost = getReferrerHost(event.referrer);

  if (referrerHost) {
    const normalizedReferrer = normalizeReferrerHost(referrerHost);
    return {
      sourceKey: normalizedReferrer.key,
      sourceLabel: normalizedReferrer.label,
      attributionModel: "referrer" as const,
      detailLabel: `Referrer ${normalizedReferrer.hostLabel}`,
    };
  }

  return {
    sourceKey: "direct",
    sourceLabel: "Direto / nao identificado",
    attributionModel: "direct" as const,
    detailLabel: "Sem UTM e sem referrer externo",
  };
}

function createLeadMap(leads: DashboardLeadRecord[]) {
  return new Map(leads.map((lead) => [lead.id, lead]));
}

function createTrafficLeadSnapshot(label: string, points: DashboardPeriodPoint[]) {
  const visitors = points.reduce((sum, point) => sum + point.visitors, 0);
  const leads = points.reduce((sum, point) => sum + point.leads, 0);
  const conversions = points.reduce((sum, point) => sum + point.conversions, 0);

  return {
    label,
    visitors,
    leads,
    conversions,
    conversionRate: visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : 0,
  };
}

function buildTrafficLeadInsights(
  previous: ReturnType<typeof createTrafficLeadSnapshot>,
  current: ReturnType<typeof createTrafficLeadSnapshot>,
  delta: DashboardTrafficLeadComparison["delta"],
  hasComparableWindow: boolean,
): DashboardTrafficLeadInsight[] {
  if (!hasComparableWindow) {
    return [
      {
        id: "single_window",
        title: "Janela ainda curta para comparacao",
        description: "Assim que houver mais pontos no periodo, o dashboard vai comparar a metade inicial com a final.",
        tone: "neutral",
      },
    ];
  }

  const insights: DashboardTrafficLeadInsight[] = [];
  const visitorDelta = delta.visitorsPercent ?? 0;
  const leadDelta = delta.leadsPercent ?? 0;
  const conversionDelta = delta.conversionRatePoints ?? 0;

  if (visitorDelta >= 15 && leadDelta <= 5) {
    insights.push({
      id: "traffic_up_leads_flat",
      title: "Trafego cresceu sem acompanhar a geracao de leads",
      description: `Visitantes subiram ${formatSignedPercent(visitorDelta)}, mas leads variaram ${formatSignedPercent(leadDelta)} na metade final do periodo.`,
      tone: "warning",
    });
  }

  if (visitorDelta <= -15 && conversionDelta >= -1) {
    insights.push({
      id: "traffic_down_conversion_steady",
      title: "Menos trafego, conversao sustentada",
      description: `O volume de visitantes caiu ${Math.abs(visitorDelta).toFixed(1)}%, enquanto a taxa de conversao ficou em ${current.conversionRate.toFixed(1)}%.`,
      tone: "neutral",
    });
  }

  if (visitorDelta >= 10 && leadDelta >= 10) {
    insights.push({
      id: "traffic_and_leads_up",
      title: "Crescimento simultaneo de trafego e leads",
      description: `A metade final ganhou ${formatSignedPercent(visitorDelta)} em visitantes e ${formatSignedPercent(leadDelta)} em leads gerados.`,
      tone: "positive",
    });
  }

  if (conversionDelta >= 2 && Math.abs(visitorDelta) < 10) {
    insights.push({
      id: "efficiency_up",
      title: "Conversao melhorou sem depender de mais trafego",
      description: `A taxa de conversao avancou ${formatSignedPoints(conversionDelta)} p.p. com variacao moderada de visitantes.`,
      tone: "positive",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "stable_window",
      title: "Janela relativamente estavel",
      description: "Nao houve deslocamentos relevantes entre volume de trafego, leads gerados e conversao no periodo comparado.",
      tone: "neutral",
    });
  }

  return insights.slice(0, 3);
}

function isTaskOverdue(task: DashboardTaskRecord) {
  return !task.completed && new Date(task.due_date).getTime() < Date.now();
}

function getDashboardPeriodOption(period: DashboardPeriodValue) {
  return DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === period) ?? DASHBOARD_PERIOD_OPTIONS[1];
}

function getPeriodRange(period: DashboardPeriodValue, options?: DashboardAggregationOptions) {
  const periodOption = getDashboardPeriodOption(period);
  const now = options?.now ? new Date(options.now) : new Date();
  const endExclusive = new Date(now);
  endExclusive.setHours(0, 0, 0, 0);
  endExclusive.setDate(endExclusive.getDate() + 1);

  const start = new Date(endExclusive);
  start.setDate(endExclusive.getDate() - periodOption.days);

  return { start, endExclusive };
}

function createPeriodBuckets(period: DashboardPeriodValue, options?: DashboardAggregationOptions) {
  const { start, endExclusive } = getPeriodRange(period, options);
  const buckets = new Map<
    string,
    {
      date: string;
      leads: number;
      visitorIds: Set<string>;
      conversionVisitorIds: Set<string>;
    }
  >();

  const currentDate = new Date(start);

  while (currentDate < endExclusive) {
    const key = toBucketKey(currentDate);
    buckets.set(key, {
      date: key,
      leads: 0,
      visitorIds: new Set<string>(),
      conversionVisitorIds: new Set<string>(),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return buckets;
}

function toBucketKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}`;
}

function isWithinPeriod(value: string, periodRange: { start: Date; endExclusive: Date }) {
  const timestamp = new Date(value).getTime();
  return timestamp >= periodRange.start.getTime() && timestamp < periodRange.endExclusive.getTime();
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

function normalizeSourceToken(source: string) {
  const normalized = source.trim().toLowerCase();

  if (matchesAlias(normalized, ["google", "googleads", "google_ads", "adwords", "gads"])) {
    return { key: "google", label: "Google" };
  }

  if (matchesAlias(normalized, ["linkedin", "lnkd", "linkedinads", "linkedin_ads"])) {
    return { key: "linkedin", label: "LinkedIn" };
  }

  if (matchesAlias(normalized, ["facebook", "fb", "meta", "facebookads", "facebook_ads"])) {
    return { key: "facebook", label: "Facebook" };
  }

  if (matchesAlias(normalized, ["instagram", "ig", "instagramads", "instagram_ads"])) {
    return { key: "instagram", label: "Instagram" };
  }

  if (matchesAlias(normalized, ["whatsapp", "wa", "whatsapp_api"])) {
    return { key: "whatsapp", label: "WhatsApp" };
  }

  if (matchesAlias(normalized, ["youtube", "youtu", "youtubeads", "youtube_ads"])) {
    return { key: "youtube", label: "YouTube" };
  }

  if (matchesAlias(normalized, ["tiktok", "tik_tok", "tt"])) {
    return { key: "tiktok", label: "TikTok" };
  }

  if (matchesAlias(normalized, ["email", "mail", "newsletter", "email_marketing"])) {
    return { key: "email", label: "Email" };
  }

  if (matchesAlias(normalized, ["direct", "direto", "directo"])) {
    return { key: "direct", label: "Direto / nao identificado" };
  }

  return {
    key: slugify(normalized),
    label: formatTokenLabel(source),
  };
}

function normalizeReferrerHost(host: string) {
  const normalized = host.trim().toLowerCase().replace(/^www\./, "");

  if (normalized.includes("google.")) {
    return { key: "google", label: "Google", hostLabel: "google" };
  }

  if (normalized.includes("linkedin.")) {
    return { key: "linkedin", label: "LinkedIn", hostLabel: "linkedin.com" };
  }

  if (normalized.includes("facebook.") || normalized.startsWith("fb.")) {
    return { key: "facebook", label: "Facebook", hostLabel: "facebook.com" };
  }

  if (normalized.includes("instagram.")) {
    return { key: "instagram", label: "Instagram", hostLabel: "instagram.com" };
  }

  if (normalized.includes("whatsapp.") || normalized.includes("wa.me")) {
    return { key: "whatsapp", label: "WhatsApp", hostLabel: "whatsapp.com" };
  }

  if (normalized.includes("youtu") || normalized.includes("youtube.")) {
    return { key: "youtube", label: "YouTube", hostLabel: "youtube.com" };
  }

  if (normalized.includes("tiktok.")) {
    return { key: "tiktok", label: "TikTok", hostLabel: "tiktok.com" };
  }

  if (normalized.includes("twitter.") || normalized.includes("x.com") || normalized.includes("t.co")) {
    return { key: "x", label: "X / Twitter", hostLabel: "x.com" };
  }

  return {
    key: slugify(normalized),
    label: formatDomainLabel(normalized),
    hostLabel: normalized,
  };
}

function getReferrerHost(referrer: string | null | undefined) {
  const value = referrer?.trim();

  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname || null;
  } catch {
    return value;
  }
}

function getCampaignLabel(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || "Sem campanha identificada";
}

function getMediumLabel(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? formatTokenLabel(normalized) : "Sem medio";
}

function getOptionalLabel(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
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

function sortAttributionRows(a: DashboardAttributionSourceRow, b: DashboardAttributionSourceRow) {
  if (b.conversions !== a.conversions) {
    return b.conversions - a.conversions;
  }

  if (b.visitors !== a.visitors) {
    return b.visitors - a.visitors;
  }

  return a.sourceLabel.localeCompare(b.sourceLabel);
}

function sortCampaignRows(
  a: DashboardCampaignRow,
  b: DashboardCampaignRow,
  sortMode: DashboardCampaignSortMode,
) {
  if (sortMode === "highest_volume") {
    if (b.visitors !== a.visitors) {
      return b.visitors - a.visitors;
    }

    if (b.conversions !== a.conversions) {
      return b.conversions - a.conversions;
    }
  }

  if (sortMode === "worst_performance") {
    const leftRate = a.conversionRate ?? Number.POSITIVE_INFINITY;
    const rightRate = b.conversionRate ?? Number.POSITIVE_INFINITY;

    if (leftRate !== rightRate) {
      return leftRate - rightRate;
    }

    if (b.visitors !== a.visitors) {
      return b.visitors - a.visitors;
    }
  }

  if (sortMode === "highest_conversion") {
    if (b.conversions !== a.conversions) {
      return b.conversions - a.conversions;
    }

    const leftRate = a.conversionRate ?? -1;
    const rightRate = b.conversionRate ?? -1;
    if (rightRate !== leftRate) {
      return rightRate - leftRate;
    }

    if (b.visitors !== a.visitors) {
      return b.visitors - a.visitors;
    }
  }

  return a.campaignLabel.localeCompare(b.campaignLabel);
}

function matchesAlias(value: string, aliases: string[]) {
  return aliases.some((alias) => value === alias || value.startsWith(`${alias}_`) || value.startsWith(`${alias}-`));
}

function normalizeToken(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized || "";
}

function calculatePercentDelta(previous: number, current: number) {
  if (previous === 0) {
    return current > 0 ? null : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(1)}%`;
}

function formatSignedPoints(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function slugify(value: string) {
  return value.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";
}

function formatDomainLabel(value: string) {
  return value
    .replace(/^www\./, "")
    .split(".")
    .slice(-2)
    .join(".")
    .toLowerCase();
}

function formatTokenLabel(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getCampaignAttributionSummary(
  status: DashboardCampaignRow["attributionStatus"],
  inputs: {
    hasSource: boolean;
    hasMedium: boolean;
    hasCampaign: boolean;
  },
) {
  if (status === "untagged") {
    return "Trafego sem UTM de campanha no periodo";
  }

  if (status === "complete") {
    return "UTM source, medium e campaign presentes";
  }

  const missingFields = [
    inputs.hasSource ? null : "source",
    inputs.hasMedium ? null : "medium",
    inputs.hasCampaign ? null : "campaign",
  ].filter(Boolean);

  return `UTM incompleta: falta ${missingFields.join(", ")}`;
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
