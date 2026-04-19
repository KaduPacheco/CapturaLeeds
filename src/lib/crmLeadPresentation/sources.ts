import { CrmLead, CrmSourceOption } from "@/types/crm";

export const LEAD_SOURCE_FILTER_ALL = "all";
export const LEAD_SOURCE_FILTER_WITHOUT_SOURCE = "without_source";
export const LEAD_SOURCE_FILTER_PREFIX = "source:";

export type LeadSourceFilter =
  | typeof LEAD_SOURCE_FILTER_ALL
  | typeof LEAD_SOURCE_FILTER_WITHOUT_SOURCE
  | `${typeof LEAD_SOURCE_FILTER_PREFIX}${string}`;

export function buildSourceOptions(leads: Iterable<Pick<CrmLead, "origem">>) {
  const options = new Map<string, CrmSourceOption>();

  for (const lead of leads) {
    const normalizedSource = normalizeSourceValue(lead.origem);

    if (!normalizedSource) {
      continue;
    }

    options.set(normalizedSource, {
      value: normalizedSource,
      label: getLeadSourceLabel(normalizedSource),
    });
  }

  return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

export function getLeadSourceLabel(source: string | null | undefined) {
  const normalizedSource = normalizeSourceValue(source);
  return normalizedSource ? toTitleCase(normalizedSource) : "Sem origem";
}

export function getLeadSourceFilterValue(source: string) {
  return `${LEAD_SOURCE_FILTER_PREFIX}${source}` as const;
}

export function matchesSourceFilter(source: string | null | undefined, filter: LeadSourceFilter) {
  if (filter === LEAD_SOURCE_FILTER_ALL) {
    return true;
  }

  const normalizedSource = normalizeSourceValue(source);

  if (filter === LEAD_SOURCE_FILTER_WITHOUT_SOURCE) {
    return !normalizedSource;
  }

  return normalizedSource === getSourceValueFromFilter(filter);
}

function getSourceValueFromFilter(filter: LeadSourceFilter) {
  return filter.startsWith(LEAD_SOURCE_FILTER_PREFIX)
    ? filter.slice(LEAD_SOURCE_FILTER_PREFIX.length)
    : null;
}

function normalizeSourceValue(source: string | null | undefined) {
  const normalizedSource = (source || "").trim().toLowerCase();
  return normalizedSource || "";
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
