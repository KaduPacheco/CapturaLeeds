import { describe, expect, it, vi } from "vitest";
import type { CrmLead, CrmLeadTaskOverview } from "@/types/crm";
import { selectLeadsListViewModel } from "@/features/crm/leads/list/selectors/leadListSelectors";

function createLead(overrides: Partial<CrmLead> = {}): CrmLead {
  return {
    id: "lead-1",
    nome: "Joao da Silva",
    whatsapp: "+55 (11) 99999-0000",
    email: "joao@example.com",
    empresa: "Empresa Alpha",
    funcionarios: 12,
    origem: "meta_ads",
    status: "novo",
    pipeline_stage: "novo",
    owner_id: "owner-1",
    lifetime_value: null,
    created_at: "2026-04-13T09:00:00.000Z",
    updated_at: "2026-04-13T09:00:00.000Z",
    last_interaction_at: null,
    ...overrides,
  };
}

function createTask(overrides: Partial<CrmLeadTaskOverview> = {}): CrmLeadTaskOverview {
  return {
    id: "task-1",
    lead_id: "lead-1",
    assignee_id: "owner-1",
    title: "Ligar para o lead",
    due_date: "2026-04-14T09:00:00.000Z",
    completed: false,
    ...overrides,
  };
}

describe("leadListSelectors", () => {
  it("builds the same operational view model for rows, filters and pagination", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-13T12:00:00.000Z"));

    const viewModel = selectLeadsListViewModel({
      leads: [
        createLead(),
        createLead({
          id: "lead-2",
          nome: "Maria Souza",
          owner_id: null,
          origem: "",
          pipeline_stage: null,
          status: "",
          created_at: "2026-04-10T08:00:00.000Z",
        }),
      ],
      tasksOverview: [
        createTask(),
        createTask({
          id: "task-2",
          lead_id: "lead-2",
          assignee_id: "owner-2",
          due_date: "2026-04-12T08:00:00.000Z",
        }),
      ],
      currentUser: {
        id: "owner-1",
        email: "owner@example.com",
        user_metadata: {},
      },
      state: {
        searchTerm: "",
        stageFilter: "all",
        ownerFilter: "all",
        sourceFilter: "all",
        periodFilter: "all",
        sortOption: "priority",
        page: 1,
        pageSize: 10,
      },
    });

    expect(viewModel.leadRows).toHaveLength(2);
    expect(viewModel.ownerOptions[0]?.id).toBe("owner-1");
    expect(viewModel.sourceOptions.map((item) => item.value)).toEqual(["meta_ads"]);
    expect(viewModel.sortedRows.map((row) => row.lead.id)).toEqual(["lead-2", "lead-1"]);
    expect(viewModel.overdueLeads).toBe(1);
    expect(viewModel.unassignedLeads).toBe(1);
    expect(viewModel.hasActiveFilters).toBe(false);

    vi.useRealTimers();
  });

  it("marks filters as active only when the current snapshot differs from defaults", () => {
    const viewModel = selectLeadsListViewModel({
      leads: [createLead()],
      tasksOverview: [],
      currentUser: null,
      state: {
        searchTerm: "joao",
        stageFilter: "all",
        ownerFilter: "all",
        sourceFilter: "all",
        periodFilter: "all",
        sortOption: "priority",
        page: 1,
        pageSize: 10,
      },
    });

    expect(viewModel.filteredRows).toHaveLength(1);
    expect(viewModel.hasActiveFilters).toBe(true);
  });
});
