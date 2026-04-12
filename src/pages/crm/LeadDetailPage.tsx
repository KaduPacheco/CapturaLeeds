import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckSquare,
  Clock,
  History,
  MessageSquare,
  Package,
  Send,
  Square,
  UserRound,
} from "lucide-react";
import LeadStageBadge from "@/components/crm/LeadStageBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  PIPELINE_STAGE_OPTIONS,
  buildLeadTaskSummary,
  buildOwnerLabelMap,
  buildOwnerOptions,
  formatTaskDueDate,
  getLeadStageValue,
  getLeadStageOptionLabel,
  getOwnerDisplayLabel,
} from "@/lib/crmLeadPresentation";
import {
  createLeadNote,
  createLeadTask,
  getCrmLeadById,
  getCrmOwnerIds,
  getLeadEvents,
  getLeadNotes,
  getLeadTasks,
  updateLeadOwner,
  updateLeadPipelineStage,
  updateTaskStatus,
} from "@/services/crmService";
import { CrmLeadEvent, CrmLeadNote, CrmLeadTask, PipelineStage } from "@/types/crm";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

interface TimelineItem {
  id: string;
  kind: "note" | "event";
  title: string;
  content?: string;
  createdAt: string;
  tone: "primary" | "muted" | "success";
  icon: React.ReactNode;
}

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const leadQuery = useQuery({
    queryKey: ["crm-lead", id],
    queryFn: () => getCrmLeadById(id!),
    enabled: Boolean(id),
  });

  const ownerIdsQuery = useQuery({
    queryKey: ["crm-owner-ids"],
    queryFn: getCrmOwnerIds,
    enabled: Boolean(id),
  });

  const notesQuery = useQuery({
    queryKey: ["crm-lead-notes", id],
    queryFn: () => getLeadNotes(id!),
    enabled: Boolean(id),
  });

  const eventsQuery = useQuery({
    queryKey: ["crm-lead-events", id],
    queryFn: () => getLeadEvents(id!),
    enabled: Boolean(id),
  });

  const tasksQuery = useQuery({
    queryKey: ["crm-lead-tasks", id],
    queryFn: () => getLeadTasks(id!),
    enabled: Boolean(id),
  });

  const noteMutation = useMutation({
    mutationFn: () => createLeadNote(id!, newNote, user!.id),
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, id);
      setNewNote("");
      toast({ title: "Nota adicionada" });
    },
  });

  const taskMutation = useMutation({
    mutationFn: () =>
      createLeadTask({
        lead_id: id!,
        title: taskTitle,
        due_date: taskDate,
        assignee_id: user!.id,
      }),
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["crm-leads-task-overview"] });
      setTaskTitle("");
      setTaskDate("");
      toast({ title: "Follow-up agendado" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => updateTaskStatus(taskId, completed),
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["crm-leads-task-overview"] });
    },
  });

  const stageMutation = useMutation({
    mutationFn: (nextStage: PipelineStage) => updateLeadPipelineStage(id!, nextStage),
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast({ title: "Etapa atualizada" });
    },
  });

  const ownerMutation = useMutation({
    mutationFn: ({
      nextOwnerId,
      previousOwnerLabel,
      nextOwnerLabel,
    }: {
      nextOwnerId: string | null;
      previousOwnerLabel?: string;
      nextOwnerLabel?: string;
    }) => updateLeadOwner(id!, nextOwnerId, { previousOwnerLabel, nextOwnerLabel }),
    onSuccess: (_, variables) => {
      invalidateLeadWorkspace(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-owner-ids"] });
      toast({ title: variables.nextOwnerId ? "Lead atribuido" : "Ownership removido" });
    },
  });

  const taskSummary = useMemo(() => buildLeadTaskSummary(tasksQuery.data ?? []), [tasksQuery.data]);
  const ownerOptions = useMemo(() => buildOwnerOptions(ownerIdsQuery.data ?? [], user), [ownerIdsQuery.data, user]);
  const ownerLabelMap = useMemo(() => buildOwnerLabelMap(ownerOptions), [ownerOptions]);
  const timelineItems = useMemo(
    () => buildTimelineItems(notesQuery.data ?? [], eventsQuery.data ?? [], ownerLabelMap, user?.id),
    [eventsQuery.data, notesQuery.data, ownerLabelMap, user?.id],
  );

  const handleAddNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newNote.trim() || !user?.id) {
      return;
    }

    noteMutation.mutate();
  };

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskTitle.trim() || !taskDate || !user?.id) {
      return;
    }

    taskMutation.mutate();
  };

  const lead = leadQuery.data;
  const tasks = tasksQuery.data ?? [];
  const currentStage = getLeadStageValue(lead ?? { pipeline_stage: null, status: "novo" });
  const currentOwnerLabel = getOwnerDisplayLabel(lead?.owner_id ?? null, user?.id, ownerLabelMap);
  const selectedStageValue = currentStage === "without_stage" ? "" : currentStage;

  if (leadQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
        <div className="rounded-[28px] border border-border/70 bg-card p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Carregando dossie comercial...</p>
        </div>
      </div>
    );
  }

  if (leadQuery.isError || !lead) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
        <div className="rounded-[28px] border border-destructive/20 bg-destructive/5 p-12 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-4 text-lg font-semibold text-foreground">Nao foi possivel carregar o lead</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {leadQuery.isError ? (leadQuery.error as Error).message : "Lead nao encontrado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <Link to="/crm/leads" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Voltar para leads
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dossie do lead</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ownership, pendencias e historico comercial do lead em um unico contexto.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Etapa atual</p>
            <div className="mt-2">
              <LeadStageBadge lead={lead} className="text-[10px]" />
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Responsavel atual</p>
            <p className="mt-2 text-sm font-medium text-foreground">{currentOwnerLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr),340px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Lead</p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{lead.nome}</h2>
                <p className="text-sm text-muted-foreground">{lead.empresa || "Empresa nao informada"}</p>
              </div>
              <LeadStageBadge lead={lead} />
            </div>

            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
              <Field label="Contato" value={lead.whatsapp || "Nao informado"} />
              <Field label="E-mail" value={lead.email || "Nao informado"} />
              <Field label="Origem" value={lead.origem || "Nao informada"} />
              <Field label="Porte" value={lead.funcionarios ? `${lead.funcionarios} funcionarios` : "Nao informado"} />
              <Field label="Criado em" value={new Date(lead.created_at).toLocaleString("pt-BR")} />
              <Field label="Responsavel" value={currentOwnerLabel} />
            </div>
          </section>

          <section className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-5">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Pipeline e ownership</h2>
                <p className="text-sm text-muted-foreground">
                  Atualize a etapa comercial e defina ownership real para o lead.
                </p>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr),280px]">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <OperationalSummaryCard
                    label="Estagio vigente"
                    value={currentStage === "without_stage" ? "Sem etapa" : getLeadStageOptionLabel(currentStage)}
                    helper="Toda mudanca fica registrada na timeline do lead."
                    tone={currentStage === "without_stage" ? "danger" : "neutral"}
                  />
                  <OperationalSummaryCard
                    label="Ownership vigente"
                    value={currentOwnerLabel}
                    helper={lead.owner_id ? "Responsavel definido para conduzir o lead." : "Lead disponivel para distribuicao."}
                    tone={lead.owner_id ? "neutral" : "danger"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Etapa atual</label>
                  <select
                    value={selectedStageValue}
                    onChange={(event) => {
                      if (!event.target.value) {
                        return;
                      }

                      stageMutation.mutate(event.target.value as PipelineStage);
                    }}
                    disabled={stageMutation.isPending}
                    className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="" disabled>
                      Sem etapa definida
                    </option>
                    {PIPELINE_STAGE_OPTIONS.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">
                    {currentStage === "without_stage"
                      ? "Este lead ainda nao foi classificado no funil comercial."
                      : PIPELINE_STAGE_OPTIONS.find((stage) => stage.value === currentStage)?.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ownership</p>
                  <select
                    value={lead.owner_id ?? ""}
                    onChange={(event) => {
                      const nextOwnerId = event.target.value || null;

                      if (nextOwnerId === lead.owner_id) {
                        return;
                      }

                      const nextOwnerOption = ownerOptions.find((option) => option.id === nextOwnerId);

                      ownerMutation.mutate({
                        nextOwnerId,
                        previousOwnerLabel: lead.owner_id ? currentOwnerLabel : undefined,
                        nextOwnerLabel: nextOwnerOption?.displayLabel,
                      });
                    }}
                    disabled={ownerMutation.isPending}
                    className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">Sem responsavel</option>
                    {ownerOptions.map((ownerOption) => (
                      <option key={ownerOption.id} value={ownerOption.id}>
                        {ownerOption.selectLabel}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">
                    {lead.owner_id
                      ? `Responsavel atual: ${currentOwnerLabel}`
                      : "Este lead ainda nao possui ownership definido."}
                  </p>
                  {ownerIdsQuery.isError ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      A lista de responsaveis esta operando em modo reduzido. Sem uma tabela publica de perfis no backend,
                      o CRM usa apenas owners ja vistos nos leads e o usuario autenticado atual.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <OperationalSummaryCard
                  label="Proxima acao"
                  value={taskSummary.nextTask ? taskSummary.nextTask.title : "Sem follow-up aberto"}
                  helper={taskSummary.nextTask ? `Ate ${formatTaskDueDate(taskSummary.nextTask.due_date)}` : "Crie uma tarefa para definir o proximo passo."}
                  tone={taskSummary.overdueCount > 0 ? "danger" : "neutral"}
                />
                <OperationalSummaryCard
                  label="Tarefas abertas"
                  value={String(taskSummary.openCount)}
                  helper={`${taskSummary.overdueCount} vencidas`}
                  tone={taskSummary.overdueCount > 0 ? "danger" : "neutral"}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-5">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Follow-ups e tarefas</h2>
                <p className="text-sm text-muted-foreground">Controle a agenda comercial e marque pendencias concluida.</p>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              {tasksQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando agenda comercial...</p>
              ) : tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isOverdue = !task.completed && new Date(task.due_date).getTime() < Date.now();
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-4 rounded-2xl border px-4 py-4",
                          task.completed ? "border-border/50 bg-muted/20 opacity-70" : "border-border/70 bg-background/80",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleTaskMutation.mutate({ taskId: task.id, completed: !task.completed })}
                          className="mt-0.5 text-primary transition-transform hover:scale-110"
                        >
                          {task.completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                        <div className="flex-1">
                          <p className={cn("font-medium text-foreground", task.completed && "line-through")}>{task.title}</p>
                          <p className={cn("mt-1 text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                            {isOverdue ? "Vencida" : "Vence"} em {formatTaskDueDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                  Sem tarefas agendadas para este lead.
                </div>
              )}

              <form onSubmit={handleAddTask} className="grid gap-3 border-t border-dashed border-border pt-5 sm:grid-cols-[minmax(0,1fr),160px,auto]">
                <Input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Nova tarefa ou follow-up"
                />
                <Input
                  type="date"
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                />
                <Button type="submit" disabled={taskMutation.isPending || !taskTitle.trim() || !taskDate || !user?.id}>
                  Agendar
                </Button>
              </form>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-5">
              <History className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Timeline de atividades</h2>
                <p className="text-sm text-muted-foreground">
                  Notas, agenda e mudancas de pipeline aparecem no mesmo historico.
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              {notesQuery.isLoading || eventsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Sincronizando timeline...</p>
              ) : timelineItems.length > 0 ? (
                <div className="space-y-5">
                  {timelineItems.map((item) => (
                    <article key={item.id} className="flex gap-4">
                      <div className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        item.tone === "primary" && "bg-primary/10 text-primary",
                        item.tone === "success" && "bg-secondary/10 text-secondary",
                        item.tone === "muted" && "bg-muted text-muted-foreground",
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        {item.content ? (
                          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                            {item.content}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-12 text-center text-sm text-muted-foreground">
                  <Package className="h-8 w-8" />
                  Nenhuma atividade registrada ainda.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Send className="h-4 w-4" />
              <h2 className="font-semibold text-foreground">Anotacao rapida</h2>
            </div>
            <form onSubmit={handleAddNote} className="mt-4 space-y-3">
              <textarea
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Registre contexto comercial, objeções ou combinados."
                className="min-h-[140px] w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" className="w-full" disabled={noteMutation.isPending || !newNote.trim() || !user?.id}>
                Salvar nota
              </Button>
            </form>
          </section>

          <section className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Resumo operacional</h2>
            </div>
            <div className="mt-4 space-y-3">
              <OperationalSummaryCard
                label="Ownership"
                value={currentOwnerLabel}
                helper={lead.owner_id ? "Lead atribuido a uma pessoa responsavel." : "Ainda disponivel para distribuicao."}
                tone={lead.owner_id ? "neutral" : "danger"}
              />
              <OperationalSummaryCard
                label="Ultima entrada"
                value={new Date(lead.created_at).toLocaleDateString("pt-BR")}
                helper={lead.origem || "Origem nao informada"}
                tone="neutral"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function OperationalSummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "neutral" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-2xl border px-4 py-4",
      tone === "danger" ? "border-destructive/20 bg-destructive/5" : "border-border/70 bg-muted/20",
    )}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("mt-3 text-lg font-semibold text-foreground", tone === "danger" && "text-destructive")}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function buildTimelineItems(
  notes: CrmLeadNote[],
  events: CrmLeadEvent[],
  ownerLabelMap: ReadonlyMap<string, string>,
  currentUserId?: string,
): TimelineItem[] {
  const noteItems: TimelineItem[] = notes.map((note) => ({
    id: note.id,
    kind: "note",
    title: "Nota interna",
    content: note.content,
    createdAt: note.created_at,
    tone: "primary",
    icon: <MessageSquare className="h-4 w-4" />,
  }));

  const eventItems: TimelineItem[] = events.map((event) => ({
    id: event.id,
    kind: "event",
    title: getEventTitle(event),
    content: getEventDescription(event, ownerLabelMap, currentUserId),
    createdAt: event.created_at,
    tone: getEventTone(event.event_type),
    icon: getEventIcon(event.event_type),
  }));

  return [...noteItems, ...eventItems].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function getEventTitle(event: CrmLeadEvent) {
  switch (event.event_type) {
    case "task_added":
      return "Follow-up agendado";
    case "task_completed":
      return "Tarefa concluida";
    case "task_reopened":
      return "Tarefa reaberta";
    case "pipeline_change":
      return "Etapa comercial atualizada";
    case "owner_changed":
      return "Ownership ajustado";
    case "note_added":
      return "Nota registrada";
    default:
      return "Atividade do lead";
  }
}

function getEventDescription(
  event: CrmLeadEvent,
  ownerLabelMap: ReadonlyMap<string, string>,
  currentUserId?: string,
) {
  switch (event.event_type) {
    case "task_added":
    case "task_completed":
    case "task_reopened":
      return getPayloadString(event.payload, "title") || undefined;
    case "pipeline_change": {
      const previousStage = getStageLabelFromPayload(getPayloadString(event.payload, "previous_stage"));
      const nextStage = getStageLabelFromPayload(getPayloadString(event.payload, "next_stage"));

      if (!previousStage && nextStage) {
        return `Lead classificado em ${nextStage}.`;
      }

      if (previousStage && nextStage) {
        return `${previousStage} -> ${nextStage}`;
      }

      return undefined;
    }
    case "owner_changed": {
      const previousOwnerLabel = getOwnerLabelFromPayload(
        event.payload,
        "previous_owner_label",
        "previous_owner_id",
        ownerLabelMap,
        currentUserId,
      );
      const nextOwnerLabel = getOwnerLabelFromPayload(
        event.payload,
        "next_owner_label",
        "next_owner_id",
        ownerLabelMap,
        currentUserId,
      );

      if (!previousOwnerLabel && nextOwnerLabel) {
        return `Lead atribuido para ${nextOwnerLabel}.`;
      }

      if (previousOwnerLabel && nextOwnerLabel) {
        return `${previousOwnerLabel} -> ${nextOwnerLabel}`;
      }

      if (previousOwnerLabel) {
        return `${previousOwnerLabel} removido; lead voltou para fila sem responsavel.`;
      }

      return "Ownership atualizado.";
    }
    case "note_added":
      return getPayloadString(event.payload, "content_preview") || undefined;
    default:
      return undefined;
  }
}

function getEventTone(eventType: CrmLeadEvent["event_type"]): TimelineItem["tone"] {
  if (eventType === "task_completed") {
    return "success";
  }

  if (eventType === "pipeline_change" || eventType === "owner_changed" || eventType === "note_added") {
    return "primary";
  }

  return "muted";
}

function getEventIcon(eventType: CrmLeadEvent["event_type"]) {
  switch (eventType) {
    case "task_added":
    case "task_completed":
    case "task_reopened":
      return <CalendarClock className="h-4 w-4" />;
    case "pipeline_change":
      return <Activity className="h-4 w-4" />;
    case "owner_changed":
      return <UserRound className="h-4 w-4" />;
    case "note_added":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getStageLabelFromPayload(value: string) {
  if (!value) {
    return "";
  }

  if (
    value === "novo"
    || value === "em_contato"
    || value === "qualificado"
    || value === "ganho"
    || value === "perdido"
  ) {
    return getLeadStageOptionLabel(value);
  }

  return value;
}

function getOwnerLabelFromPayload(
  payload: Record<string, unknown>,
  labelKey: string,
  idKey: string,
  ownerLabelMap: ReadonlyMap<string, string>,
  currentUserId?: string,
) {
  const explicitLabel = getPayloadString(payload, labelKey);

  if (explicitLabel) {
    return explicitLabel;
  }

  const ownerId = getPayloadString(payload, idKey);

  return ownerId ? getOwnerDisplayLabel(ownerId, currentUserId, ownerLabelMap) : "";
}

function invalidateLeadWorkspace(queryClient: ReturnType<typeof useQueryClient>, leadId?: string) {
  queryClient.invalidateQueries({ queryKey: ["crm-lead", leadId] });
  queryClient.invalidateQueries({ queryKey: ["crm-lead-notes", leadId] });
  queryClient.invalidateQueries({ queryKey: ["crm-lead-events", leadId] });
  queryClient.invalidateQueries({ queryKey: ["crm-lead-tasks", leadId] });
}

export default LeadDetailPage;
