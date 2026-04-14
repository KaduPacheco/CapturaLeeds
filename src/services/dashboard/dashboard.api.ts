import { supabase } from "@/lib/supabase";
import { CrmLead, CrmLeadEvent, CrmLeadTask } from "@/types/crm";
import {
  ANALYTICS_FETCH_MAX_RECORDS,
  ANALYTICS_FETCH_PAGE_SIZE,
} from "@/services/dashboard/dashboard.constants";

export type DashboardLeadRecord = Pick<
  CrmLead,
  | "id"
  | "nome"
  | "empresa"
  | "origem"
  | "status"
  | "pipeline_stage"
  | "owner_id"
  | "whatsapp"
  | "email"
  | "created_at"
  | "updated_at"
>;

export type DashboardTaskRecord = Pick<
  CrmLeadTask,
  "id" | "lead_id" | "assignee_id" | "title" | "due_date" | "completed" | "created_at" | "updated_at"
>;

export type DashboardEventRecord = Pick<CrmLeadEvent, "id" | "lead_id" | "event_type" | "payload" | "created_at">;

export type DashboardAnalyticsEventRecord = {
  id: string;
  event_type: string;
  visitor_id: string;
  session_id: string;
  occurred_at: string;
  page_path: string;
  page_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  metadata: Record<string, unknown>;
};

export async function getDashboardLeadsDataset(): Promise<DashboardLeadRecord[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id,nome,empresa,origem,status,pipeline_stage,owner_id,whatsapp,email,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao carregar leads do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardLeadRecord[];
}

export async function getDashboardTasksDataset(): Promise<DashboardTaskRecord[]> {
  const { data, error } = await supabase
    .from("lead_tasks")
    .select("id,lead_id,assignee_id,title,due_date,completed,created_at,updated_at")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar tarefas do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardTaskRecord[];
}

export async function getDashboardEventsDataset(limit = 10): Promise<DashboardEventRecord[]> {
  const { data, error } = await supabase
    .from("lead_events")
    .select("id,lead_id,event_type,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Falha ao carregar atividades do dashboard: ${error.message}`);
  }

  return (data ?? []) as DashboardEventRecord[];
}

export async function getDashboardAnalyticsDataset(
  days = 30,
  maxRecords = ANALYTICS_FETCH_MAX_RECORDS,
): Promise<DashboardAnalyticsEventRecord[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records: DashboardAnalyticsEventRecord[] = [];
  let pageIndex = 0;

  while (records.length < maxRecords) {
    const from = pageIndex * ANALYTICS_FETCH_PAGE_SIZE;
    const to = Math.min(from + ANALYTICS_FETCH_PAGE_SIZE - 1, maxRecords - 1);

    const { data, error } = await supabase
      .from("analytics_events")
      .select(
        "id,event_type,visitor_id,session_id,occurred_at,page_path,page_url,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,metadata",
      )
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Falha ao carregar analytics do dashboard: ${error.message}`);
    }

    const page = (data ?? []) as DashboardAnalyticsEventRecord[];
    records.push(...page);

    if (page.length < ANALYTICS_FETCH_PAGE_SIZE) {
      break;
    }

    pageIndex += 1;
  }

  return records;
}
