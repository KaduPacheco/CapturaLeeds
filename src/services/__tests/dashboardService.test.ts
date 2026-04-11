import { describe, expect, it } from "vitest";
import { buildAnalyticsKpis, buildPerformanceSeries, isAnalyticsUnavailableErrorMessage } from "../dashboardService";

describe("dashboardService builders", () => {
  it("calculates unique visitors and conversion rate from analytics events", () => {
    const metrics = buildAnalyticsKpis(
      [
        {
          event_name: "page_view",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          occurred_at: "2026-04-10T10:00:00.000Z",
        },
        {
          event_name: "page_view",
          visitor_id: "visitor-2",
          session_id: "session-2",
          page_path: "/",
          referrer: null,
          utm_source: "linkedin",
          utm_medium: "paid",
          utm_campaign: "crm",
          occurred_at: "2026-04-10T11:00:00.000Z",
        },
        {
          event_name: "lead_form_submit_success",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          occurred_at: "2026-04-10T11:05:00.000Z",
        },
      ],
      "30d",
    );

    expect(metrics.find((metric) => metric.id === "period_visitors")?.value).toBe(2);
    expect(metrics.find((metric) => metric.id === "conversion_rate")?.valueDisplay).toBe("50.0%");
  });

  it("builds a period series that merges visitors, conversions and leads by day", () => {
    const series = buildPerformanceSeries(
      [
        {
          event_name: "page_view",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          occurred_at: "2026-04-10T10:00:00.000Z",
        },
        {
          event_name: "lead_form_submit_success",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          occurred_at: "2026-04-10T10:10:00.000Z",
        },
      ],
      [
        {
          id: "lead-1",
          nome: "Lead Teste",
          empresa: "Empresa",
          origem: "landing_page",
          status: "novo",
          pipeline_stage: "novo",
          owner_id: null,
          whatsapp: "11999999999",
          email: "lead@teste.com",
          created_at: "2026-04-10T10:15:00.000Z",
          updated_at: "2026-04-10T10:15:00.000Z",
        },
      ],
      "7d",
    );

    const populatedDay = series.find((point) => point.date === "2026-04-10");
    expect(populatedDay).toEqual(
      expect.objectContaining({
        visitors: 1,
        conversions: 1,
        leads: 1,
        conversionRate: 100,
      }),
    );
  });

  it("detects analytics unavailability from contract and relation errors", () => {
    expect(
      isAnalyticsUnavailableErrorMessage(
        "A base de analytics ainda nao esta disponivel neste ambiente. Aplique a migration 05_analytics_events.sql para habilitar visitantes e conversao.",
      ),
    ).toBe(true);

    expect(isAnalyticsUnavailableErrorMessage('relation "public.analytics_events" does not exist')).toBe(true);
    expect(isAnalyticsUnavailableErrorMessage("network timeout")).toBe(false);
  });
});
