import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { CRM_QUERY_KEYS } from "@/features/crm/shared/queryKeys/crmQueryKeys";
import { PipelineStage } from "@/features/crm/shared/types/crm";
import { logAppEvent, getErrorMessage } from "@/lib/appLogger";
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

interface UpdateLeadOwnerInput {
  nextOwnerId: string | null;
  previousOwnerLabel?: string;
  nextOwnerLabel?: string;
}

interface CreateLeadTaskInput {
  title: string;
  dueDate: string;
}

export function useLeadWorkspace(leadId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const leadQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.lead(leadId),
    queryFn: () => getCrmLeadById(leadId!),
    enabled: Boolean(leadId),
  });

  const ownerIdsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.ownerIds,
    queryFn: getCrmOwnerIds,
    enabled: Boolean(leadId),
  });

  const notesQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.leadNotes(leadId),
    queryFn: () => getLeadNotes(leadId!),
    enabled: Boolean(leadId),
  });

  const eventsQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.leadEvents(leadId),
    queryFn: () => getLeadEvents(leadId!),
    enabled: Boolean(leadId),
  });

  const tasksQuery = useQuery({
    queryKey: CRM_QUERY_KEYS.leadTasks(leadId),
    queryFn: () => getLeadTasks(leadId!),
    enabled: Boolean(leadId),
  });

  const noteMutation = useMutation({
    mutationFn: async (content: string) => {
      ensureLeadMutationPreconditions(leadId, user?.id);
      return createLeadNote(leadId!, content, user!.id);
    },
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, leadId);
      toast({ title: "Nota adicionada" });
    },
    onError: (error) => {
      reportLeadMutationError("Nao foi possivel salvar a nota.", error, leadId, toast);
    },
  });

  const taskMutation = useMutation({
    mutationFn: async ({ title, dueDate }: CreateLeadTaskInput) => {
      ensureLeadMutationPreconditions(leadId, user?.id);
      return createLeadTask({
        lead_id: leadId!,
        title,
        due_date: dueDate,
        assignee_id: user!.id,
      });
    },
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, leadId);
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leadsTaskOverview });
      toast({ title: "Follow-up agendado" });
    },
    onError: (error) => {
      reportLeadMutationError("Nao foi possivel agendar o follow-up.", error, leadId, toast);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => updateTaskStatus(taskId, completed),
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, leadId);
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leadsTaskOverview });
    },
    onError: (error) => {
      reportLeadMutationError("Nao foi possivel atualizar a tarefa.", error, leadId, toast);
    },
  });

  const stageMutation = useMutation({
    mutationFn: (nextStage: PipelineStage) => {
      ensureLeadMutationPreconditions(leadId, user?.id);
      return updateLeadPipelineStage(leadId!, nextStage);
    },
    onSuccess: () => {
      invalidateLeadWorkspace(queryClient, leadId);
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leads });
      toast({ title: "Etapa atualizada" });
    },
    onError: (error) => {
      reportLeadMutationError("Nao foi possivel atualizar a etapa.", error, leadId, toast);
    },
  });

  const ownerMutation = useMutation({
    mutationFn: (input: UpdateLeadOwnerInput) => {
      ensureLeadMutationPreconditions(leadId, user?.id);
      return updateLeadOwner(leadId!, input.nextOwnerId, {
        previousOwnerLabel: input.previousOwnerLabel,
        nextOwnerLabel: input.nextOwnerLabel,
      });
    },
    onSuccess: (_, variables) => {
      invalidateLeadWorkspace(queryClient, leadId);
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.ownerIds });
      toast({ title: variables.nextOwnerId ? "Lead atribuido" : "Ownership removido" });
    },
    onError: (error) => {
      reportLeadMutationError("Nao foi possivel atualizar o ownership.", error, leadId, toast);
    },
  });

  return {
    user,
    leadQuery,
    ownerIdsQuery,
    notesQuery,
    eventsQuery,
    tasksQuery,
    noteMutation,
    taskMutation,
    toggleTaskMutation,
    stageMutation,
    ownerMutation,
  };
}

function ensureLeadMutationPreconditions(leadId?: string, userId?: string) {
  if (!leadId) {
    throw new Error("Lead nao informado para a operacao.");
  }

  if (!userId) {
    throw new Error("Sessao autenticada obrigatoria para esta operacao.");
  }
}

function reportLeadMutationError(
  title: string,
  error: unknown,
  leadId: string | undefined,
  toast: ReturnType<typeof useToast>["toast"],
) {
  const description = getErrorMessage(error, "Tente novamente em instantes.");

  logAppEvent("crm.lead-workspace", "warn", title, {
    leadId,
    error: description,
  });

  toast({
    title,
    description,
    variant: "destructive",
  });
}

function invalidateLeadWorkspace(queryClient: ReturnType<typeof useQueryClient>, leadId?: string) {
  queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.lead(leadId) });
  queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leadNotes(leadId) });
  queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leadEvents(leadId) });
  queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.leadTasks(leadId) });
}
