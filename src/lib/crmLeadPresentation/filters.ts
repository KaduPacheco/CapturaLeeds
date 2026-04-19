import { CrmLead } from "@/types/crm";
import { matchesOwnerFilter, LeadOwnerFilter } from "@/lib/crmLeadPresentation/owners";
import { matchesSourceFilter, LeadSourceFilter } from "@/lib/crmLeadPresentation/sources";
import { getLeadStageValue, LeadStageFilter } from "@/lib/crmLeadPresentation/stages";
import { LeadTaskStatusSummary } from "@/lib/crmLeadPresentation/taskSummary";

export type LeadsViewMode = "list" | "kanban";
export type LeadPeriodFilter = "all" | "today" | "7d" | "30d" | "90d";

export interface LeadListFilters {
  searchTerm: string;
  stageFilter: LeadStageFilter;
  ownerFilter: LeadOwnerFilter;
  sourceFilter: LeadSourceFilter;
  periodFilter: LeadPeriodFilter;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function matchesLeadPeriod(createdAt: string, periodFilter: LeadPeriodFilter, referenceDate = new Date()) {
  if (periodFilter === "all") {
    return true;
  }

  const createdAtTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtTime)) {
    return false;
  }

  const start = new Date(referenceDate);

  if (periodFilter === "today") {
    start.setHours(0, 0, 0, 0);
    return createdAtTime >= start.getTime();
  }

  const windowInDays = periodFilter === "7d"
    ? 7
    : periodFilter === "30d"
      ? 30
      : 90;

  return createdAtTime >= referenceDate.getTime() - windowInDays * DAY_IN_MS;
}

export function matchesLeadSearch(
  lead: Pick<CrmLead, "nome" | "empresa" | "email" | "whatsapp">,
  searchTerm: string,
) {
  const normalizedTerm = normalizeSearchTerm(searchTerm);

  if (!normalizedTerm) {
    return true;
  }

  const digitTerm = normalizeDigits(searchTerm);
  const searchableFields = [lead.nome, lead.empresa, lead.email, lead.whatsapp]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (digitTerm) {
    const phoneDigits = normalizeDigits(lead.whatsapp);

    if (phoneDigits.includes(digitTerm)) {
      return true;
    }
  }

  return searchableFields.some((field) => normalizeSearchTerm(field).includes(normalizedTerm));
}

export function filterLeadRows<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(
  rows: T[],
  filters: LeadListFilters,
  currentUserId?: string,
) {
  return rows.filter(({ lead }) => {
    const matchesStage = filters.stageFilter === "all"
      ? true
      : filters.stageFilter === "without_stage"
        ? getLeadStageValue(lead) === "without_stage"
        : getLeadStageValue(lead) === filters.stageFilter;

    return matchesStage
      && matchesOwnerFilter(lead.owner_id, filters.ownerFilter, currentUserId)
      && matchesSourceFilter(lead.origem, filters.sourceFilter)
      && matchesLeadPeriod(lead.created_at, filters.periodFilter)
      && matchesLeadSearch(lead, filters.searchTerm);
  });
}

function normalizeSearchTerm(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function normalizeDigits(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}
