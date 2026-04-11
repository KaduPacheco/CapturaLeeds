export type DashboardMetricTone = "neutral" | "positive" | "warning" | "danger";
export type DashboardPeriodValue = "7d" | "30d" | "90d";

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
