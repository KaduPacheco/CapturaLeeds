import { CrmLead } from "@/types/crm";
import { getLeadStageValue } from "@/lib/crmLeadPresentation/stages";
import { LeadTaskStatusSummary } from "@/lib/crmLeadPresentation/taskSummary";

export type LeadSortOption = "priority" | "newest" | "oldest" | "next_follow_up" | "name_asc";

export function sortLeadRows<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(
  rows: T[],
  sortOption: LeadSortOption,
) {
  return [...rows].sort((left, right) => {
    switch (sortOption) {
      case "newest":
        return compareDates(right.lead.created_at, left.lead.created_at);
      case "oldest":
        return compareDates(left.lead.created_at, right.lead.created_at);
      case "next_follow_up":
        return compareNextTask(left.taskSummary, right.taskSummary) || comparePriority(left, right);
      case "name_asc":
        return left.lead.nome.localeCompare(right.lead.nome, "pt-BR") || comparePriority(left, right);
      case "priority":
      default:
        return comparePriority(left, right);
    }
  });
}

function comparePriority<T extends { lead: CrmLead; taskSummary: LeadTaskStatusSummary }>(left: T, right: T) {
  const leftPriority = getPriorityRank(left);
  const rightPriority = getPriorityRank(right);

  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  const nextTaskComparison = compareNextTask(left.taskSummary, right.taskSummary);

  if (nextTaskComparison !== 0) {
    return nextTaskComparison;
  }

  return compareDates(right.lead.created_at, left.lead.created_at);
}

function compareNextTask(left: LeadTaskStatusSummary, right: LeadTaskStatusSummary) {
  const leftNextTaskTime = left.nextTask ? new Date(left.nextTask.due_date).getTime() : Number.POSITIVE_INFINITY;
  const rightNextTaskTime = right.nextTask ? new Date(right.nextTask.due_date).getTime() : Number.POSITIVE_INFINITY;

  if (leftNextTaskTime !== rightNextTaskTime) {
    return leftNextTaskTime - rightNextTaskTime;
  }

  return right.overdueCount - left.overdueCount;
}

function compareDates(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime();
}

function getPriorityRank(row: { lead: Pick<CrmLead, "owner_id" | "pipeline_stage" | "status">; taskSummary: LeadTaskStatusSummary }) {
  const stageValue = getLeadStageValue(row.lead);
  const isClosedStage = stageValue === "ganho" || stageValue === "perdido";

  let rank = 0;

  if (row.taskSummary.overdueCount > 0) {
    rank += 100;
  }

  if (!row.lead.owner_id) {
    rank += 30;
  }

  if (stageValue === "without_stage") {
    rank += 20;
  }

  if (!row.taskSummary.nextTask && !isClosedStage) {
    rank += 10;
  }

  if (isClosedStage) {
    rank -= 25;
  }

  return rank;
}
