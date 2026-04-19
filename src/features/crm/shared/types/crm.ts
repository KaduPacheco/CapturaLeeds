export type PipelineStage = "novo" | "em_contato" | "qualificado" | "perdido" | "ganho";

export interface CrmLeadEventPayload extends Record<string, unknown> {
  title?: string;
  due_date?: string;
  content_preview?: string;
  to?: string;
  previous_stage?: PipelineStage | null;
  next_stage?: PipelineStage | null;
  previous_owner_id?: string | null;
  next_owner_id?: string | null;
  previous_owner_label?: string | null;
  next_owner_label?: string | null;
}

export interface CrmLead {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  empresa?: string;
  funcionarios?: number;
  origem: string;
  status: string;
  pipeline_stage: PipelineStage | null;
  owner_id: string | null;
  lifetime_value: number | null;
  created_at: string;
  updated_at: string;
  last_interaction_at: string | null;
}

export interface CrmLeadEvent {
  id: string;
  lead_id: string;
  event_type:
    | "note_added"
    | "task_added"
    | "task_completed"
    | "task_reopened"
    | "status_change"
    | "pipeline_change"
    | "owner_changed"
    | "lead_created";
  payload: CrmLeadEventPayload;
  created_at: string;
}

export interface CrmLeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CrmLeadTask {
  id: string;
  lead_id: string;
  assignee_id: string;
  title: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmLeadTaskOverview {
  id: string;
  lead_id: string;
  assignee_id: string;
  title: string;
  due_date: string;
  completed: boolean;
}

export interface CrmOwnerOption {
  id: string;
  displayLabel: string;
  selectLabel: string;
}

export interface CrmSourceOption {
  value: string;
  label: string;
}
