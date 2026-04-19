import { useDeferredValue, useState } from "react";
import { LEAD_OWNER_FILTER_ALL, type LeadOwnerFilter } from "@/lib/crmLeadPresentation/owners";
import { LEAD_SOURCE_FILTER_ALL, type LeadSourceFilter } from "@/lib/crmLeadPresentation/sources";
import { type LeadPeriodFilter, type LeadsViewMode } from "@/lib/crmLeadPresentation/filters";
import { type LeadPageSize } from "@/lib/crmLeadPresentation/pagination";
import { type LeadSortOption } from "@/lib/crmLeadPresentation/sorting";
import { type LeadStageFilter } from "@/lib/crmLeadPresentation/stages";

export function useLeadsListState() {
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

  return {
    searchTerm,
    stageFilter,
    ownerFilter,
    sourceFilter,
    periodFilter,
    sortOption,
    page,
    pageSize,
    viewMode,
    deferredSearchTerm,
    setPage,
    setViewMode,
    updateSearchTerm,
    updateStageFilter,
    updateOwnerFilter,
    updateSourceFilter,
    updatePeriodFilter,
    updateSortOption,
    updatePageSize,
    clearFilters,
  };
}
