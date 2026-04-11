import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Globe,
  LayoutDashboard,
  Percent,
  Users,
} from "lucide-react";
import AttentionPanel from "@/components/crm/dashboard/AttentionPanel";
import ActivityFeed from "@/components/crm/dashboard/ActivityFeed";
import KpiCard from "@/components/crm/dashboard/KpiCard";
import PeriodPerformanceChart from "@/components/crm/dashboard/PeriodPerformanceChart";
import PipelineChart from "@/components/crm/dashboard/PipelineChart";
import RecentLeadsList from "@/components/crm/dashboard/RecentLeadsList";
import SourceChart from "@/components/crm/dashboard/SourceChart";
import UpcomingTasksList from "@/components/crm/dashboard/UpcomingTasksList";
import { Button } from "@/components/ui/Button";
import {
  ANALYTICS_MIGRATION_FILE,
  DASHBOARD_PERIOD_OPTIONS,
  buildActivityFeed,
  buildAnalyticsKpis,
  buildAttentionPanel,
  buildLeadKpis,
  buildPerformanceSeries,
  buildPipelineDistribution,
  buildRecentLeads,
  buildSourceDistribution,
  buildTaskKpis,
  buildUpcomingTasks,
  getDashboardAnalyticsDataset,
  getDashboardEventsDataset,
  getDashboardLeadsDataset,
  getDashboardTasksDataset,
  isAnalyticsUnavailableErrorMessage,
} from "@/services/dashboardService";
import { DashboardPeriodValue } from "@/types/dashboard";

const DashboardPage = () => {
  const [period, setPeriod] = useState<DashboardPeriodValue>("30d");

  const leadsQuery = useQuery({
    queryKey: ["crm-dashboard", "leads"],
    queryFn: getDashboardLeadsDataset,
    staleTime: 30_000,
  });

  const tasksQuery = useQuery({
    queryKey: ["crm-dashboard", "tasks"],
    queryFn: getDashboardTasksDataset,
    staleTime: 30_000,
  });

  const eventsQuery = useQuery({
    queryKey: ["crm-dashboard", "events"],
    queryFn: () => getDashboardEventsDataset(8),
    staleTime: 20_000,
  });

  const analyticsQuery = useQuery({
    queryKey: ["crm-dashboard", "analytics", period],
    queryFn: () => getDashboardAnalyticsDataset(period),
    staleTime: 20_000,
    retry: (failureCount, error) => {
      if (isAnalyticsUnavailableErrorMessage(getErrorMessage(error))) {
        return false;
      }

      return failureCount < 1;
    },
  });

  const analyticsErrorMessage = analyticsQuery.isError ? getErrorMessage(analyticsQuery.error) : undefined;
  const analyticsUnavailable = isAnalyticsUnavailableErrorMessage(analyticsErrorMessage);
  const hasOperationalErrors = leadsQuery.isError || tasksQuery.isError || eventsQuery.isError;

  const leadMetrics = useMemo(
    () => (leadsQuery.data ? buildLeadKpis(leadsQuery.data, period) : []),
    [leadsQuery.data, period],
  );
  const taskMetrics = useMemo(() => (tasksQuery.data ? buildTaskKpis(tasksQuery.data) : []), [tasksQuery.data]);
  const analyticsMetrics = useMemo(
    () => (analyticsQuery.data ? buildAnalyticsKpis(analyticsQuery.data, period) : []),
    [analyticsQuery.data, period],
  );

  const pipelineData = useMemo(() => (leadsQuery.data ? buildPipelineDistribution(leadsQuery.data) : []), [leadsQuery.data]);
  const sourceData = useMemo(() => (leadsQuery.data ? buildSourceDistribution(leadsQuery.data) : []), [leadsQuery.data]);
  const performanceData = useMemo(
    () =>
      leadsQuery.data && analyticsQuery.data ? buildPerformanceSeries(analyticsQuery.data, leadsQuery.data, period) : [],
    [analyticsQuery.data, leadsQuery.data, period],
  );
  const recentLeads = useMemo(() => (leadsQuery.data ? buildRecentLeads(leadsQuery.data) : []), [leadsQuery.data]);
  const upcomingTasks = useMemo(
    () => (tasksQuery.data ? buildUpcomingTasks(tasksQuery.data, leadsQuery.data) : []),
    [leadsQuery.data, tasksQuery.data],
  );
  const activityFeed = useMemo(
    () => (eventsQuery.data ? buildActivityFeed(eventsQuery.data, leadsQuery.data) : []),
    [eventsQuery.data, leadsQuery.data],
  );
  const attentionData = useMemo(
    () => (leadsQuery.data && tasksQuery.data ? buildAttentionPanel(leadsQuery.data, tasksQuery.data) : undefined),
    [leadsQuery.data, tasksQuery.data],
  );

  const lastUpdatedAt = Math.max(
    leadsQuery.dataUpdatedAt || 0,
    tasksQuery.dataUpdatedAt || 0,
    eventsQuery.dataUpdatedAt || 0,
    analyticsQuery.dataUpdatedAt || 0,
  );

  const selectedPeriod = DASHBOARD_PERIOD_OPTIONS.find((option) => option.value === period) ?? DASHBOARD_PERIOD_OPTIONS[1];

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
                Operacao comercial, aquisicao e pontos de atencao em uma unica tela.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                O painel combina pipeline, agenda, atividade do time e a nova camada de analytics da landing para
                mostrar volume, execucao e conversao com dados reais do produto.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Janela</p>
              <div className="mt-3 flex items-center gap-3">
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value as DashboardPeriodValue)}
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  aria-label="Selecionar periodo do dashboard"
                >
                  {DASHBOARD_PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">KPIs e grafico temporal atualizados em {selectedPeriod.label}.</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
              <p className="mt-3 text-sm font-medium text-foreground">
                {hasOperationalErrors
                  ? "Algumas secoes exigem revisao"
                  : analyticsUnavailable
                    ? "CRM operacional ativo · analytics pendente"
                    : analyticsQuery.isError
                      ? "Analytics exige revisao"
                      : "Dashboard sincronizado"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasOperationalErrors
                  ? "Leads, tarefas ou atividade recente precisam de revisao."
                  : analyticsUnavailable
                    ? `Aplicar ${ANALYTICS_MIGRATION_FILE} habilita visitantes, conversao e evolucao por periodo.`
                    : lastUpdatedAt
                      ? `Ultima atualizacao em ${formatDateTime(lastUpdatedAt)}`
                      : "Sincronizando dados do CRM"}
              </p>
            </div>

            <Button asChild className="h-auto justify-between rounded-3xl px-4 py-4 sm:col-span-2">
              <Link to="/crm/leads">
                Explorar leads e follow-ups
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "period_visitors")}
          icon={Globe}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsErrorMessage}
          isUnavailable={analyticsUnavailable}
        />
        <KpiCard
          metric={analyticsMetrics.find((metric) => metric.id === "conversion_rate")}
          icon={Percent}
          isLoading={analyticsQuery.isLoading}
          errorMessage={analyticsErrorMessage}
          isUnavailable={analyticsUnavailable}
        />
      </section>

      <PeriodPerformanceChart
        data={performanceData}
        isLoading={analyticsQuery.isLoading || leadsQuery.isLoading}
        errorMessage={
          analyticsQuery.isError
            ? analyticsErrorMessage
            : leadsQuery.isError
              ? getErrorMessage(leadsQuery.error)
              : undefined
        }
        isUnavailable={analyticsUnavailable}
      />

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

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default DashboardPage;
