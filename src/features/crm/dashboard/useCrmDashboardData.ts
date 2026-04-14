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
} from "@/services/dashboardService";

const ANALYTICS_WINDOW_DAYS = 30;

export function useCrmDashboardData() {
  const leadsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardLeads,
    queryFn: getDashboardLeadsDataset,
    staleTime: 30_000,
  });

  const tasksQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardTasks,
    queryFn: getDashboardTasksDataset,
    staleTime: 30_000,
  });

  const eventsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardEvents,
    queryFn: () => getDashboardEventsDataset(8),
    staleTime: 20_000,
  });

  const analyticsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.dashboardAnalytics,
    queryFn: () => getDashboardAnalyticsDataset(ANALYTICS_WINDOW_DAYS),
    staleTime: 20_000,
  });

  const leadMetrics = leadsQuery.data ? buildLeadKpis(leadsQuery.data) : [];
  const taskMetrics = tasksQuery.data ? buildTaskKpis(tasksQuery.data) : [];
  const analyticsMetrics = analyticsQuery.data ? buildAnalyticsKpis(analyticsQuery.data) : [];

  const pipelineData = leadsQuery.data ? buildPipelineDistribution(leadsQuery.data) : [];
  const sourceData = leadsQuery.data ? buildSourceDistribution(leadsQuery.data) : [];
  const analyticsFunnelData = analyticsQuery.data ? buildAnalyticsFunnel(analyticsQuery.data) : [];
  const analyticsSeriesData = analyticsQuery.data
    ? buildAnalyticsSeries(analyticsQuery.data, ANALYTICS_WINDOW_DAYS)
    : [];
  const analyticsSourceData = analyticsQuery.data ? buildAnalyticsSourceDistribution(analyticsQuery.data) : [];
  const trafficVsLeadsData = analyticsQuery.data ? buildTrafficVsLeadsComparison(analyticsQuery.data) : [];
  const recentLeads = leadsQuery.data ? buildRecentLeads(leadsQuery.data) : [];
  const upcomingTasks = tasksQuery.data ? buildUpcomingTasks(tasksQuery.data, leadsQuery.data) : [];
  const activityFeed = eventsQuery.data ? buildActivityFeed(eventsQuery.data, leadsQuery.data) : [];
  const attentionData =
    leadsQuery.data && tasksQuery.data ? buildAttentionPanel(leadsQuery.data, tasksQuery.data) : undefined;

  const lastUpdatedAt = Math.max(
    leadsQuery.dataUpdatedAt || 0,
    tasksQuery.dataUpdatedAt || 0,
    eventsQuery.dataUpdatedAt || 0,
    analyticsQuery.dataUpdatedAt || 0,
  );

  return {
    analyticsWindowDays: ANALYTICS_WINDOW_DAYS,
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
