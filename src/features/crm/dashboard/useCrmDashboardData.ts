import { useQuery } from "@tanstack/react-query";
import { CRM_QUERY_KEYS } from "@/features/crm/shared/queryKeys/crmQueryKeys";
import {
  buildActivityFeed,
  buildAnalyticsFunnel,
  buildAnalyticsKpis,
  buildAnalyticsSeries,
  buildAnalyticsSourceDistribution,
  buildAttentionPanel,
  buildLeadKpis,
  buildPipelineDistribution,
  buildRecentLeads,
  buildSourceDistribution,
  buildTaskKpis,
  buildTrafficVsLeadsComparison,
  buildUpcomingTasks,
  getDashboardAnalyticsDataset,
  getDashboardEventsDataset,
  getDashboardLeadsDataset,
  getDashboardTasksDataset,
} from "@/features/crm/dashboard/services/dashboardService";

const ANALYTICS_WINDOW_DAYS = 30;
const DASHBOARD_EVENTS_LIMIT = 8;

interface UseCrmDashboardDataOptions {
  includeLeads?: boolean;
  includeTasks?: boolean;
  includeEvents?: boolean;
  includeAnalytics?: boolean;
  analyticsWindowDays?: number;
  eventsLimit?: number;
}

export function useCrmDashboardData(options: UseCrmDashboardDataOptions = {}) {
  const {
    includeLeads = true,
    includeTasks = true,
    includeEvents = true,
    includeAnalytics = true,
    analyticsWindowDays = ANALYTICS_WINDOW_DAYS,
    eventsLimit = DASHBOARD_EVENTS_LIMIT,
  } = options;

  const leadsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardLeads,
    queryFn: getDashboardLeadsDataset,
    enabled: includeLeads,
    staleTime: 30_000,
  });

  const tasksQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardTasks,
    queryFn: getDashboardTasksDataset,
    enabled: includeTasks,
    staleTime: 30_000,
  });

  const eventsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardEvents,
    queryFn: () => getDashboardEventsDataset(eventsLimit),
    enabled: includeEvents,
    staleTime: 20_000,
  });

  const analyticsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardAnalytics,
    queryFn: () => getDashboardAnalyticsDataset(analyticsWindowDays),
    enabled: includeAnalytics,
    staleTime: 20_000,
  });

  const leadMetrics = leadsQuery.data ? buildLeadKpis(leadsQuery.data) : [];
  const taskMetrics = tasksQuery.data ? buildTaskKpis(tasksQuery.data) : [];
  const analyticsMetrics = analyticsQuery.data ? buildAnalyticsKpis(analyticsQuery.data) : [];

  const pipelineData = leadsQuery.data ? buildPipelineDistribution(leadsQuery.data) : [];
  const sourceData = leadsQuery.data ? buildSourceDistribution(leadsQuery.data) : [];
  const analyticsFunnelData = analyticsQuery.data ? buildAnalyticsFunnel(analyticsQuery.data) : [];
  const analyticsSeriesData = analyticsQuery.data
    ? buildAnalyticsSeries(analyticsQuery.data, analyticsWindowDays)
    : [];
  const analyticsSourceData = analyticsQuery.data ? buildAnalyticsSourceDistribution(analyticsQuery.data) : [];
  const trafficVsLeadsData = analyticsQuery.data ? buildTrafficVsLeadsComparison(analyticsQuery.data) : [];
  const recentLeads = leadsQuery.data ? buildRecentLeads(leadsQuery.data) : [];
  const upcomingTasks = tasksQuery.data ? buildUpcomingTasks(tasksQuery.data, leadsQuery.data) : [];
  const activityFeed = eventsQuery.data ? buildActivityFeed(eventsQuery.data, leadsQuery.data) : [];
  const attentionData =
    leadsQuery.data && tasksQuery.data ? buildAttentionPanel(leadsQuery.data, tasksQuery.data) : undefined;

  const lastUpdatedAt = Math.max(
    includeLeads ? leadsQuery.dataUpdatedAt || 0 : 0,
    includeTasks ? tasksQuery.dataUpdatedAt || 0 : 0,
    includeEvents ? eventsQuery.dataUpdatedAt || 0 : 0,
    includeAnalytics ? analyticsQuery.dataUpdatedAt || 0 : 0,
  );

  return {
    analyticsWindowDays,
    eventsLimit,
    leadsQuery,
    tasksQuery,
    eventsQuery,
    analyticsQuery,
    leadMetrics,
    taskMetrics,
    analyticsMetrics,
    pipelineData,
    sourceData,
    analyticsFunnelData,
    analyticsSeriesData,
    analyticsSourceData,
    trafficVsLeadsData,
    recentLeads,
    upcomingTasks,
    activityFeed,
    attentionData,
    lastUpdatedAt,
  };
}
