export type DashboardMetricTone = "neutral" | "positive" | "warning" | "danger";

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
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

export interface DashboardAnalyticsSeriesDatum {
  id: string;
  label: string;
  periodStart: string;
  visitors: number;
  pageViews: number;
  ctaClicks: number;
  leads: number;
  conversionRate: number;
}

export interface DashboardTrafficComparisonDatum {
  id: string;
  label: string;
  visitors: number;
  leads: number;
  conversionRate: number;
  visitorsShare: number;
  leadsShare: number;
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
