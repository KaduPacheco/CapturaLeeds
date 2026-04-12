import { describe, expect, it, vi } from "vitest";
import {
  LEAD_OWNER_FILTER_MINE,
  LEAD_OWNER_FILTER_UNASSIGNED,
  buildLeadTaskSummary,
  buildOwnerLabelMap,
  buildOwnerOptions,
  getLeadStageValue,
  getOwnerFilterValueForId,
  matchesOwnerFilter,
} from "../crmLeadPresentation";

describe("crmLeadPresentation", () => {
  it("normalizes the commercial stage using pipeline_stage first", () => {
    expect(getLeadStageValue({ pipeline_stage: "qualificado", status: "novo" })).toBe("qualificado");
    expect(getLeadStageValue({ pipeline_stage: null, status: "ganho" })).toBe("ganho");
    expect(getLeadStageValue({ pipeline_stage: null, status: "desconhecido" })).toBe("without_stage");
  });

  it("builds the operational task summary with next task and overdue count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));

    const summary = buildLeadTaskSummary([
      {
        id: "task-1",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Ligar hoje",
        due_date: "2026-04-11T10:00:00.000Z",
        completed: false,
      },
      {
        id: "task-2",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Enviar proposta",
        due_date: "2026-04-12T10:00:00.000Z",
        completed: false,
      },
      {
        id: "task-3",
        lead_id: "lead-1",
        assignee_id: "user-1",
        title: "Concluida",
        due_date: "2026-04-10T10:00:00.000Z",
        completed: true,
      },
    ]);

    expect(summary).toEqual(
      expect.objectContaining({
        openCount: 2,
        overdueCount: 1,
        nextTask: expect.objectContaining({
          id: "task-1",
          title: "Ligar hoje",
        }),
      }),
    );

    vi.useRealTimers();
  });

  it("builds owner options with current user first and stable labels", () => {
    const ownerOptions = buildOwnerOptions(
      ["owner-b", "owner-a", "user-1", "owner-a", null],
      {
        id: "user-1",
        email: "ana@empresa.com",
        user_metadata: { full_name: "Ana Souza" },
      } as never,
    );

    expect(ownerOptions).toEqual([
      {
        id: "user-1",
        displayLabel: "Voce",
        selectLabel: "Voce (Ana Souza)",
      },
      {
        id: "owner-a",
        displayLabel: "Responsavel owner-a",
        selectLabel: "Responsavel owner-a",
      },
      {
        id: "owner-b",
        displayLabel: "Responsavel owner-b",
        selectLabel: "Responsavel owner-b",
      },
    ]);

    expect(buildOwnerLabelMap(ownerOptions).get("user-1")).toBe("Voce");
  });

  it("matches mine, unassigned and specific owner filters", () => {
    expect(matchesOwnerFilter("user-1", LEAD_OWNER_FILTER_MINE, "user-1")).toBe(true);
    expect(matchesOwnerFilter(null, LEAD_OWNER_FILTER_UNASSIGNED, "user-1")).toBe(true);
    expect(matchesOwnerFilter("owner-2", getOwnerFilterValueForId("owner-2"), "user-1")).toBe(true);
    expect(matchesOwnerFilter("owner-3", getOwnerFilterValueForId("owner-2"), "user-1")).toBe(false);
  });
});
