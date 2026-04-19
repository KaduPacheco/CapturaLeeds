import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, CircleAlert } from "lucide-react";
import DashboardSection from "@/features/crm/shared/components/DashboardSection";
import {
  SectionEmptyState,
  SectionErrorState,
  SectionSkeleton,
} from "@/features/crm/shared/components/SectionStates";
import { DashboardUpcomingTaskItem } from "@/types/dashboard";

interface UpcomingTasksListProps {
  data?: DashboardUpcomingTaskItem[];
  isLoading?: boolean;
  errorMessage?: string;
}

const UpcomingTasksList = ({ data, isLoading, errorMessage }: UpcomingTasksListProps) => {
  return (
    <DashboardSection
      title="Proximos follow-ups"
      subtitle="Agenda por vencimento."
      action={
        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Ir para leads
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {isLoading ? (
        <SectionSkeleton rows={5} />
      ) : errorMessage ? (
        <SectionErrorState
          title="Falha ao carregar a agenda"
          description={errorMessage}
        />
      ) : !data || data.length === 0 ? (
        <SectionEmptyState
          title="Sem follow-ups pendentes"
          description="Quando houver tarefas abertas, a fila priorizada aparecera aqui."
          icon={<CalendarClock className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-3">
          {data.map((task) => (
            <Link
              key={task.id}
              to={`/crm/leads/${task.leadId}`}
              className="block rounded-[20px] border border-border/65 bg-muted/[0.12] px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        task.overdue
                          ? "border border-destructive/20 bg-destructive/10 text-destructive"
                          : "border border-secondary/20 bg-secondary/10 text-secondary"
                      }`}
                    >
                      {task.overdue ? "Atrasada" : "No prazo"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.leadName}
                    {task.company ? ` - ${task.company}` : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                    <span
                      className="max-w-[20ch] truncate rounded-full border border-border/70 bg-background/55 px-2.5 py-1 text-[10px] font-medium text-foreground/85"
                      title={task.stageLabel}
                    >
                      {task.stageLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {task.overdue ? (
                        <CircleAlert className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <CalendarClock className="h-3.5 w-3.5" />
                      )}
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
};

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default UpcomingTasksList;
