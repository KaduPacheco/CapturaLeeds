import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCcw } from "lucide-react";
import LeadStageBadge from "@/components/crm/LeadStageBadge";
import LeadsKanbanBoard from "@/components/crm/leads/LeadsKanbanBoard";
import LeadsPaginationControls from "@/components/crm/leads/LeadsPaginationControls";
import LeadsResultsTable, { LeadWithSummary } from "@/components/crm/leads/LeadsResultsTable";
import LeadsWorkspaceToolbar from "@/components/crm/leads/LeadsWorkspaceToolbar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LEAD_OWNER_FILTER_ALL,
  LEAD_SOURCE_FILTER_ALL,
  LeadPageSize,
  LeadOwnerFilter,
  LeadPeriodFilter,
  LeadSortOption,
  LeadSourceFilter,
  LeadsViewMode,
  LeadStageFilter,
  buildLeadTaskSummary,
  buildOwnerLabelMap,
  buildOwnerOptions,
  buildSourceOptions,
  filterLeadRows,
  paginateCollection,
  sortLeadRows,
} from "@/lib/crmLeadPresentation";
import { getCrmLeads, getLeadTasksOverview } from "@/services/crmService";
import { CrmLeadTaskOverview } from "@/types/crm";

const LeadsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStageFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState<LeadOwnerFilter>(LEAD_OWNER_FILTER_ALL);
  const [sourceFilter, setSourceFilter] = useState<LeadSourceFilter>(LEAD_SOURCE_FILTER_ALL);
  const [periodFilter, setPeriodFilter] = useState<LeadPeriodFilter>("all");
  const [sortOption, setSortOption] = useState<LeadSortOption>("priority");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<LeadPageSize>(10);
  const [viewMode, setViewMode] = useState<LeadsViewMode>("list");
  const deferredSearchTerm = useDeferredValue(searchTerm);

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

  const ownerOptions = useMemo(
    () => buildOwnerOptions(leadRows.map(({ lead }) => lead.owner_id), user),
    [leadRows, user],
  );
  const ownerLabelMap = useMemo(() => buildOwnerLabelMap(ownerOptions), [ownerOptions]);
  const sourceOptions = useMemo(() => buildSourceOptions(leadRows.map(({ lead }) => lead)), [leadRows]);

  const filteredRows = useMemo(
    () => filterLeadRows(
      leadRows,
      {
        searchTerm: deferredSearchTerm,
        stageFilter,
        ownerFilter,
        sourceFilter,
        periodFilter,
      },
      user?.id,
    ),
    [deferredSearchTerm, leadRows, ownerFilter, periodFilter, sourceFilter, stageFilter, user?.id],
  );
  const sortedRows = useMemo(() => sortLeadRows(filteredRows, sortOption), [filteredRows, sortOption]);
  const pagination = useMemo(() => paginateCollection(sortedRows, page, pageSize), [page, pageSize, sortedRows]);

  const overdueLeads = filteredRows.filter(({ taskSummary }) => taskSummary.overdueCount > 0).length;
  const unassignedLeads = leadRows.filter(({ lead }) => !lead.owner_id).length;
  const hasActiveFilters =
    searchTerm.trim().length > 0
    || stageFilter !== "all"
    || ownerFilter !== LEAD_OWNER_FILTER_ALL
    || sourceFilter !== LEAD_SOURCE_FILTER_ALL
    || periodFilter !== "all"
    || sortOption !== "priority";

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const updateStageFilter = (value: LeadStageFilter) => {
    setStageFilter(value);
    setPage(1);
  };

  const updateOwnerFilter = (value: LeadOwnerFilter) => {
    setOwnerFilter(value);
    setPage(1);
  };

  const updateSourceFilter = (value: LeadSourceFilter) => {
    setSourceFilter(value);
    setPage(1);
  };

  const updatePeriodFilter = (value: LeadPeriodFilter) => {
    setPeriodFilter(value);
    setPage(1);
  };

  const updateSortOption = (value: LeadSortOption) => {
    setSortOption(value);
    setPage(1);
  };

  const updatePageSize = (value: LeadPageSize) => {
    setPageSize(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStageFilter("all");
    setOwnerFilter(LEAD_OWNER_FILTER_ALL);
    setSourceFilter(LEAD_SOURCE_FILTER_ALL);
    setPeriodFilter("all");
    setSortOption("priority");
    setPage(1);
  };

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
        searchTerm={searchTerm}
        stageFilter={stageFilter}
        ownerFilter={ownerFilter}
        sourceFilter={sourceFilter}
        periodFilter={periodFilter}
        sortOption={sortOption}
        ownerOptions={ownerOptions}
        sourceOptions={sourceOptions}
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        onSearchTermChange={updateSearchTerm}
        onStageFilterChange={updateStageFilter}
        onOwnerFilterChange={updateOwnerFilter}
        onSourceFilterChange={updateSourceFilter}
        onPeriodFilterChange={updatePeriodFilter}
        onSortOptionChange={updateSortOption}
        onClearFilters={clearFilters}
        onViewModeChange={setViewMode}
      />

      {tasksOverviewQuery.isError ? (
        <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-700 shadow-sm dark:text-amber-300">
          A leitura de pendencias do lead falhou nesta sincronizacao. A listagem continua disponivel, mas os indicadores
          de follow-up podem estar incompletos.
        </div>
      ) : null}

      {sortedRows.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-foreground">Nenhum lead encontrado neste recorte</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajuste busca, filtros ou periodo para voltar a ver a operacao.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <LeadsResultsTable items={pagination.items} currentUserId={user?.id} ownerLabelMap={ownerLabelMap} />
      ) : (
        <LeadsKanbanBoard items={pagination.items} currentUserId={user?.id} ownerLabelMap={ownerLabelMap} />
      )}

      <LeadsPaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={updatePageSize}
      />
    </div>
  );
};

export default LeadsPage;
