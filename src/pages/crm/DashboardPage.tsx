import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  MousePointerClick,
  SendHorizontal,
  TrendingUp,
  UsersRound,
  LayoutDashboard,
  Users,
} from "lucide-react";
import AnalyticsFunnelChart from "@/components/crm/dashboard/AnalyticsFunnelChart";
import AnalyticsSourcesChart from "@/components/crm/dashboard/AnalyticsSourcesChart";
import AnalyticsTimelineChart from "@/components/crm/dashboard/AnalyticsTimelineChart";
import AttentionPanel from "@/components/crm/dashboard/AttentionPanel";
import ActivityFeed from "@/components/crm/dashboard/ActivityFeed";
import KpiCard from "@/components/crm/dashboard/KpiCard";
import PipelineChart from "@/components/crm/dashboard/PipelineChart";
import RecentLeadsList from "@/components/crm/dashboard/RecentLeadsList";
import SourceChart from "@/components/crm/dashboard/SourceChart";
import TrafficVsLeadsChart from "@/components/crm/dashboard/TrafficVsLeadsChart";
import UpcomingTasksList from "@/components/crm/dashboard/UpcomingTasksList";
import { Button } from "@/components/ui/Button";
import { CRM_ROUTES } from "@/features/crm/shared/constants/routes";
import { formatDateTimePtBr } from "@/features/crm/shared/formatters/dateTime";
import { CRM_QUERY_KEYS } from "@/features/crm/shared/queryKeys/crmQueryKeys";
import {
  buildActivityFeed,
  buildAnalyticsFunnel,
  buildAnalyticsKpis,
  buildAnalyticsSeries,
  buildAnalyticsSourceDistribution,
  buildTrafficVsLeadsComparison,
  buildAttentionPanel,
  buildLeadKpis,
  buildPipelineDistribution,
  buildRecentLeads,
  buildSourceDistribution,
  buildTaskKpis,
  buildUpcomingTasks,
  getDashboardAnalyticsDataset,
  getDashboardEventsDataset,
  getDashboardLeadsDataset,
  getDashboardTasksDataset,
} from "@/services/dashboardService";

const ANALYTICS_WINDOW_DAYS = 30;

const DashboardPage = () => {
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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.16),transparent_38%)]" />
        <div className="relative flex flex-col gap-6 px-6 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Visao operacional do CRM
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                Acompanhe volume, execucao comercial e pontos de atencao em um so lugar.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                O dashboard consolida pipeline, operacao comercial e analytics reais da landing usando os dados
                autenticados do CRM e o tracking gravado no banco, com leitura executiva dos ultimos{" "}
                {ANALYTICS_WINDOW_DAYS} dias.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
              <p className="mt-3 text-sm font-medium text-foreground">
                {leadsQuery.isError || tasksQuery.isError || eventsQuery.isError || analyticsQuery.isError
                  ? "Algumas secoes exigem revisao"
                  : "Dashboard sincronizado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lastUpdatedAt
                  ? `Ultima atualizacao em ${formatDateTimePtBr(lastUpdatedAt)}`
                  : "Sincronizando dados do CRM"}
              </p>
            </div>

            <Button asChild className="h-auto justify-between rounded-3xl px-4 py-4">
              <Link to={CRM_ROUTES.leads}>
                Explorar leads
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          metric={leadMetrics.find((metric) => metric.id === "total_leads")}
          icon={Users}
          isLoading={leadsQuery.isLoading}
          errorMessage={leadsQuery.isError ? getErrorMessage(leadsQuery.error) : undefined}
        />
        <KpiCard
          metric={leadMetrics.find((metric) => metric.id === "new_leads")}
          icon={BriefcaseBusiness}
          isLoading={leadsQuery.isLoading}
          errorMessage={leadsQuery.isError ? getErrorMessage(leadsQuery.error) : undefined}
        />
        <KpiCard
          metric={taskMetrics.find((metric) => metric.id === "open_tasks")}
          icon={CalendarClock}
          isLoading={tasksQuery.isLoading}
          errorMessage={tasksQuery.isError ? getErrorMessage(tasksQuery.error) : undefined}
        />
        <KpiCard
          metric={taskMetrics.find((metric) => metric.id === "overdue_tasks")}
          icon={Activity}
          isLoading={tasksQuery.isLoading}
          errorMessage={tasksQuery.isError ? getErrorMessage(tasksQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "landing_visitors")}
          icon={UsersRound}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "landing_cta_clicks")}
          icon={MousePointerClick}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "landing_submit_success")}
          icon={SendHorizontal}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "landing_conversion_rate")}
          icon={TrendingUp}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <AnalyticsTimelineChart
          data={analyticsSeriesData}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
        <TrafficVsLeadsChart
          data={trafficVsLeadsData}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <PipelineChart
          data={pipelineData}
          isLoading={leadsQuery.isLoading}
          errorMessage={leadsQuery.isError ? getErrorMessage(leadsQuery.error) : undefined}
        />
        <SourceChart
          data={sourceData}
          isLoading={leadsQuery.isLoading}
          errorMessage={leadsQuery.isError ? getErrorMessage(leadsQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <AnalyticsFunnelChart
          data={analyticsFunnelData}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
        <AnalyticsSourcesChart
          data={analyticsSourceData}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <RecentLeadsList
          data={recentLeads}
          isLoading={leadsQuery.isLoading}
          errorMessage={leadsQuery.isError ? getErrorMessage(leadsQuery.error) : undefined}
        />
        <UpcomingTasksList
          data={upcomingTasks}
          isLoading={tasksQuery.isLoading}
          errorMessage={tasksQuery.isError ? getErrorMessage(tasksQuery.error) : undefined}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <ActivityFeed
          data={activityFeed}
          isLoading={eventsQuery.isLoading}
          errorMessage={eventsQuery.isError ? getErrorMessage(eventsQuery.error) : undefined}
        />
        <AttentionPanel
          data={attentionData}
          isLoading={leadsQuery.isLoading || tasksQuery.isLoading}
          errorMessage={
            leadsQuery.isError
              ? getErrorMessage(leadsQuery.error)
              : tasksQuery.isError
                ? getErrorMessage(tasksQuery.error)
                : undefined
          }
        />
      </section>
    </div>
  );
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Tente novamente em instantes.";
}

export default DashboardPage;
