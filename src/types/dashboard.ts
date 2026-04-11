export type DashboardMetricTone = "neutral" | "positive" | "warning" | "danger";
export type DashboardPeriodValue = "today" | "7d" | "30d" | "90d";

export interface DashboardKpi {
  id:
    | "total_leads"
    | "new_leads"
    | "open_tasks"
    | "overdue_tasks"
    | "period_visitors"
    | "conversion_rate";
  label: string;
  value: number;
  valueDisplay?: string;
  description: string;
  helperText: string;
  tone: DashboardMetricTone;
}

export interface DashboardChartDatum {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DashboardRecentLeadItem {
  id: string;
  name: string;
  company: string | null;
  source: string;
  stageLabel: string;
  whatsapp: string;
  email: string | null;
  createdAt: string;
}

export interface DashboardUpcomingTaskItem {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  title: string;
  dueDate: string;
  overdue: boolean;
  stageLabel: string;
}

export interface DashboardActivityItem {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  eventType: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface DashboardAttentionMetric {
  id: "without_owner" | "without_stage" | "overdue_tasks";
  label: string;
  count: number;
  description: string;
  tone: DashboardMetricTone;
}

export interface DashboardAttentionData {
  metrics: DashboardAttentionMetric[];
  overdueTasksPreview: DashboardUpcomingTaskItem[];
}

export interface DashboardPeriodOption {
  value: DashboardPeriodValue;
  label: string;
  days: number;
}

export interface DashboardPeriodPoint {
  date: string;
  label: string;
  visitors: number;
  leads: number;
  conversions: number;
  conversionRate: number;
}

export type DashboardAttributionModel = "utm" | "referrer" | "direct";

export interface DashboardAttributionSourceRow {
  id: string;
  sourceKey: string;
  sourceLabel: string;
  attributionModel: DashboardAttributionModel;
  detailLabel: string;
  visitors: number;
  conversions: number;
  conversionRate: number | null;
  visitorsShare: number;
  conversionsShare: number;
}

export interface DashboardCampaignRow {
  id: string;
  campaignLabel: string;
  sourceLabel: string;
  mediumLabel: string;
  termLabel: string | null;
  contentLabel: string | null;
  visitors: number;
  conversions: number;
  conversionRate: number | null;
  attributionStatus: "complete" | "partial" | "untagged";
  attributionSummary: string;
}

export type DashboardCampaignSortMode = "highest_volume" | "highest_conversion" | "worst_performance";

export interface DashboardFunnelStage {
  id: "visitors" | "cta_clicks" | "form_starts" | "submit_attempts" | "submit_successes";
  label: string;
  description: string;
  count: number;
  advanceRate: number | null;
  dropOffRate: number | null;
  previousCount: number | null;
  hasPartialData: boolean;
}

export interface DashboardFunnelBottleneck {
  fromStageLabel: string;
  toStageLabel: string;
  dropOffRate: number;
  dropOffCount: number;
}

export interface DashboardAcquisitionFunnel {
  stages: DashboardFunnelStage[];
  bottleneck: DashboardFunnelBottleneck | null;
  submitErrorCount: number;
  hasPartialData: boolean;
}

export interface DashboardTrafficLeadSnapshot {
  label: string;
  visitors: number;
  leads: number;
  conversions: number;
  conversionRate: number;
}

export interface DashboardTrafficLeadDelta {
  visitorsPercent: number | null;
  leadsPercent: number | null;
  conversionRatePoints: number | null;
}

export interface DashboardTrafficLeadInsight {
  id: string;
  title: string;
  description: string;
  tone: DashboardMetricTone;
}

export interface DashboardTrafficLeadComparison {
  previous: DashboardTrafficLeadSnapshot;
  current: DashboardTrafficLeadSnapshot;
  delta: DashboardTrafficLeadDelta;
  insights: DashboardTrafficLeadInsight[];
  hasComparableWindow: boolean;
}

export interface DashboardAnalyticsSnapshot {
  kpis: DashboardKpi[];
  performance: DashboardPeriodPoint[];
  attributionSources: DashboardAttributionSourceRow[];
  campaigns: DashboardCampaignRow[];
  funnel: DashboardAcquisitionFunnel;
  trafficLeadComparison: DashboardTrafficLeadComparison;
}
