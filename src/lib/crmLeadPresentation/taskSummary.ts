import { CrmLeadTaskOverview } from "@/types/crm";

export interface LeadTaskStatusSummary {
  openCount: number;
  overdueCount: number;
  nextTask: CrmLeadTaskOverview | null;
}

export function buildLeadTaskSummary(tasks: CrmLeadTaskOverview[]): LeadTaskStatusSummary {
  const openTasks = tasks.filter((task) => !task.completed);
  const now = Date.now();
  const overdueCount = openTasks.filter((task) => new Date(task.due_date).getTime() < now).length;
  const nextTask =
    [...openTasks].sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())[0] ?? null;

  return {
    openCount: openTasks.length,
    overdueCount,
    nextTask,
  };
}

export function formatTaskDueDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}
