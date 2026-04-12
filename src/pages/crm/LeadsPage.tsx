import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCcw } from "lucide-react";
import LeadStageBadge from "@/components/crm/LeadStageBadge";
import LeadsKanbanBoard from "@/components/crm/leads/LeadsKanbanBoard";
import LeadsResultsTable, { LeadWithSummary } from "@/components/crm/leads/LeadsResultsTable";
import LeadsWorkspaceToolbar from "@/components/crm/leads/LeadsWorkspaceToolbar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LEAD_OWNER_FILTER_ALL,
  LeadOwnerFilter,
  LeadsViewMode,
  LeadStageFilter,
  buildLeadTaskSummary,
  buildOwnerLabelMap,
  buildOwnerOptions,
  getLeadStageValue,
  matchesOwnerFilter,
} from "@/lib/crmLeadPresentation";
import { getCrmLeads, getLeadTasksOverview } from "@/services/crmService";
import { CrmLeadTaskOverview } from "@/types/crm";

const LeadsPage = () => {
  const { user } = useAuth();
  const [stageFilter, setStageFilter] = useState<LeadStageFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState<LeadOwnerFilter>(LEAD_OWNER_FILTER_ALL);
  const [viewMode, setViewMode] = useState<LeadsViewMode>("list");

  const leadsQuery = useQuery({
    queryKey: ["crm-leads"],
    queryFn: getCrmLeads,
  });

  const tasksOverviewQuery = useQuery({
    queryKey: ["crm-leads-task-overview"],
    queryFn: getLeadTasksOverview,
  });

  const leadRows = useMemo<LeadWithSummary[]>(() => {
    const tasksByLeadId = new Map<string, CrmLeadTaskOverview[]>();

    (tasksOverviewQuery.data ?? []).forEach((task) => {
      const currentItems = tasksByLeadId.get(task.lead_id) ?? [];
      currentItems.push(task);
      tasksByLeadId.set(task.lead_id, currentItems);
    });

    return (leadsQuery.data ?? []).map((lead) => ({
      lead,
      taskSummary: buildLeadTaskSummary(tasksByLeadId.get(lead.id) ?? []),
    }));
  }, [leadsQuery.data, tasksOverviewQuery.data]);

  const filteredRows = useMemo(() => {
    return leadRows.filter(({ lead }) => {
      const matchesStage = stageFilter === "all"
        ? true
        : stageFilter === "without_stage"
          ? getLeadStageValue(lead) === "without_stage"
          : getLeadStageValue(lead) === stageFilter;

      return matchesStage && matchesOwnerFilter(lead.owner_id, ownerFilter, user?.id);
    });
  }, [leadRows, ownerFilter, stageFilter, user?.id]);

  const ownerOptions = useMemo(
    () => buildOwnerOptions(leadRows.map(({ lead }) => lead.owner_id), user),
    [leadRows, user],
  );
  const ownerLabelMap = useMemo(() => buildOwnerLabelMap(ownerOptions), [ownerOptions]);

  const overdueLeads = filteredRows.filter(({ taskSummary }) => taskSummary.overdueCount > 0).length;
  const unassignedLeads = leadRows.filter(({ lead }) => !lead.owner_id).length;

  if (leadsQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <div className="rounded-[28px] border border-border/70 bg-card p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Sincronizando pipeline comercial...</p>
        </div>
      </div>
    );
  }

  if (leadsQuery.isError) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <div className="rounded-[28px] border border-destructive/20 bg-destructive/5 p-10 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-4 text-lg font-semibold text-foreground">Nao foi possivel carregar os leads</p>
          <p className="mt-2 text-sm text-muted-foreground">{(leadsQuery.error as Error).message}</p>
          <Button className="mt-5" onClick={() => leadsQuery.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Gestao de leads</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Trabalhe ownership, proxima acao e etapa comercial no mesmo fluxo. O objetivo aqui e deixar claro quem esta
            conduzindo cada lead e o que precisa acontecer a seguir.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Visao atual</p>
          <div className="mt-2 flex items-center gap-2">
            <LeadStageBadge lead={{ pipeline_stage: null, status: "novo" }} className="text-[10px]" />
            <p className="text-sm text-muted-foreground">Pipeline pronto para operar em lista e kanban.</p>
          </div>
        </div>
      </header>

      <LeadsWorkspaceToolbar
        totalLeads={leadRows.length}
        visibleLeads={filteredRows.length}
        overdueLeads={overdueLeads}
        unassignedLeads={unassignedLeads}
        stageFilter={stageFilter}
        ownerFilter={ownerFilter}
        ownerOptions={ownerOptions}
        viewMode={viewMode}
        onStageFilterChange={setStageFilter}
        onOwnerFilterChange={setOwnerFilter}
        onViewModeChange={setViewMode}
      />

      {tasksOverviewQuery.isError ? (
        <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-700 shadow-sm dark:text-amber-300">
          A leitura de pendencias do lead falhou nesta sincronizacao. A listagem continua disponivel, mas os indicadores
          de follow-up podem estar incompletos.
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-foreground">Nenhum lead encontrado neste recorte</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajuste os filtros de etapa ou ownership para voltar a ver a operacao.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <LeadsResultsTable items={filteredRows} currentUserId={user?.id} ownerLabelMap={ownerLabelMap} />
      ) : (
        <LeadsKanbanBoard items={filteredRows} currentUserId={user?.id} ownerLabelMap={ownerLabelMap} />
      )}
    </div>
  );
};

export default LeadsPage;
