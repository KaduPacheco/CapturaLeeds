import type { User } from "@supabase/supabase-js";
import type { CrmLead, CrmLeadTaskOverview, CrmOwnerOption, CrmSourceOption } from "@/types/crm";
import {
  LEAD_OWNER_FILTER_ALL,
  LEAD_SOURCE_FILTER_ALL,
  buildLeadTaskSummary,
  buildOwnerLabelMap,
  buildOwnerOptions,
  buildSourceOptions,
  filterLeadRows,
  paginateCollection,
  sortLeadRows,
  type LeadListFilters,
  type LeadTaskStatusSummary,
  type LeadPageSize,
  type LeadSortOption,
} from "@/lib/crmLeadPresentation";

export interface LeadWithSummary {
  lead: CrmLead;
  taskSummary: LeadTaskStatusSummary;
}

export interface LeadsListStateSnapshot extends LeadListFilters {
  sortOption: LeadSortOption;
  page: number;
  pageSize: LeadPageSize;
}

export interface LeadsListViewModel {
  leadRows: LeadWithSummary[];
  ownerOptions: CrmOwnerOption[];
  ownerLabelMap: ReadonlyMap<string, string>;
  sourceOptions: CrmSourceOption[];
  filteredRows: LeadWithSummary[];
  sortedRows: LeadWithSummary[];
  pagination: ReturnType<typeof paginateCollection<LeadWithSummary>>;
  overdueLeads: number;
  unassignedLeads: number;
  hasActiveFilters: boolean;
}

export function buildLeadRows(
  leads: CrmLead[] | undefined,
  tasksOverview: CrmLeadTaskOverview[] | undefined,
): LeadWithSummary[] {
  const tasksByLeadId = new Map<string, CrmLeadTaskOverview[]>();

  (tasksOverview ?? []).forEach((task) => {
    const currentItems = tasksByLeadId.get(task.lead_id) ?? [];
    currentItems.push(task);
    tasksByLeadId.set(task.lead_id, currentItems);
  });

  return (leads ?? []).map((lead) => ({
    lead,
    taskSummary: buildLeadTaskSummary(tasksByLeadId.get(lead.id) ?? []),
  }));
}

export function selectLeadsListViewModel(params: {
  leads: CrmLead[] | undefined;
  tasksOverview: CrmLeadTaskOverview[] | undefined;
  currentUser: Pick<User, "id" | "email" | "user_metadata"> | null | undefined;
  state: LeadsListStateSnapshot;
}): LeadsListViewModel {
  const { leads, tasksOverview, currentUser, state } = params;
  const leadRows = buildLeadRows(leads, tasksOverview);
  const ownerOptions = buildOwnerOptions(leadRows.map(({ lead }) => lead.owner_id), currentUser);
  const ownerLabelMap = buildOwnerLabelMap(ownerOptions);
  const sourceOptions = buildSourceOptions(leadRows.map(({ lead }) => lead));
  const filteredRows = filterLeadRows(
    leadRows,
    {
      searchTerm: state.searchTerm,
      stageFilter: state.stageFilter,
      ownerFilter: state.ownerFilter,
      sourceFilter: state.sourceFilter,
      periodFilter: state.periodFilter,
    },
    currentUser?.id,
  );
  const sortedRows = sortLeadRows(filteredRows, state.sortOption);
  const pagination = paginateCollection(sortedRows, state.page, state.pageSize);
  const overdueLeads = filteredRows.filter(({ taskSummary }) => taskSummary.overdueCount > 0).length;
  const unassignedLeads = leadRows.filter(({ lead }) => !lead.owner_id).length;

  return {
    leadRows,
    ownerOptions,
    ownerLabelMap,
    sourceOptions,
    filteredRows,
    sortedRows,
    pagination,
    overdueLeads,
    unassignedLeads,
    hasActiveFilters: hasActiveLeadsListFilters(state),
  };
}

export function hasActiveLeadsListFilters(state: Pick<
  LeadsListStateSnapshot,
  "searchTerm" | "stageFilter" | "ownerFilter" | "sourceFilter" | "periodFilter" | "sortOption"
>) {
  return state.searchTerm.trim().length > 0
    || state.stageFilter !== "all"
    || state.ownerFilter !== LEAD_OWNER_FILTER_ALL
    || state.sourceFilter !== LEAD_SOURCE_FILTER_ALL
    || state.periodFilter !== "all"
    || state.sortOption !== "priority";
}
