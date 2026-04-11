export type AnalyticsEventName =
  | "page_view"
  | "cta_click"
  | "lead_form_start"
  | "lead_form_submit_attempt"
  | "lead_form_submit_success"
  | "lead_form_submit_error";

export interface AnalyticsAttributionContext {
  visitorId: string;
  sessionId: string;
  landingPath: string;
  landingUrl: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  capturedAt: string;
}

export interface AnalyticsEventRecord {
  event_name: AnalyticsEventName;
  visitor_id: string;
  session_id: string;
  page_path: string;
  page_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  occurred_at: string;
  event_payload: Record<string, unknown>;
}

export interface TrackAnalyticsEventInput {
  eventName: AnalyticsEventName;
  payload?: Record<string, unknown>;
}
