import { describe, expect, it } from "vitest";
import {
  buildAcquisitionFunnel,
  buildAnalyticsDashboardSnapshot,
  DASHBOARD_PERIOD_OPTIONS,
  buildAnalyticsKpis,
  buildAttributionSourceRows,
  buildCampaignRanking,
  buildLeadKpis,
  buildPerformanceSeries,
  buildTrafficLeadComparison,
  isAnalyticsUnavailableErrorMessage,
  sortCampaignRanking,
} from "../dashboardService";

describe("dashboardService builders", () => {
  it("calculates unique visitors and conversion rate from analytics events", () => {
    const metrics = buildAnalyticsKpis(
      [
        {
          event_name: "page_view",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T10:00:00.000Z",
        },
        {
          event_name: "page_view",
          visitor_id: "visitor-2",
          session_id: "session-2",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "linkedin",
          utm_medium: "paid",
          utm_campaign: "crm",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T11:00:00.000Z",
        },
        {
          event_name: "lead_form_submit_success",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T11:05:00.000Z",
        },
      ],
      "30d",
    );

    expect(metrics.find((metric) => metric.id === "period_visitors")).toEqual(
      expect.objectContaining({
        label: "Visitantes em 30 dias",
        value: 2,
      }),
    );
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
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T10:00:00.000Z",
        },
        {
          event_name: "lead_form_submit_success",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm",
          utm_term: null,
          utm_content: null,
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
      {
        now: new Date("2026-04-12T12:00:00.000Z"),
      },
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

    const emptyDay = series.find((point) => point.date === "2026-04-11");
    expect(emptyDay).toEqual(
      expect.objectContaining({
        visitors: 0,
        conversions: 0,
        leads: 0,
        conversionRate: 0,
      }),
    );
  });

  it("supports the today filter with bounded lead totals", () => {
    const metrics = buildLeadKpis(
      [
        {
          id: "lead-today",
          nome: "Lead Hoje",
          empresa: "Empresa",
          origem: "landing_page",
          status: "novo",
          pipeline_stage: "novo",
          owner_id: null,
          whatsapp: "11999999999",
          email: "lead@teste.com",
          created_at: "2026-04-10T09:15:00.000Z",
          updated_at: "2026-04-10T09:15:00.000Z",
        },
        {
          id: "lead-old",
          nome: "Lead Antigo",
          empresa: "Empresa",
          origem: "landing_page",
          status: "novo",
          pipeline_stage: "novo",
          owner_id: null,
          whatsapp: "11999999998",
          email: "old@teste.com",
          created_at: "2026-04-09T23:15:00.000Z",
          updated_at: "2026-04-09T23:15:00.000Z",
        },
      ],
      "today",
      {
        now: new Date("2026-04-10T15:00:00.000Z"),
      },
    );

    expect(metrics.find((metric) => metric.id === "new_leads")).toEqual(
      expect.objectContaining({
        label: "Novos hoje",
        value: 1,
      }),
    );
  });

  it("exposes useful period filters including today", () => {
    expect(DASHBOARD_PERIOD_OPTIONS.map((option) => option.value)).toEqual(["today", "7d", "30d", "90d"]);
  });

  it("normalizes origins from utm source, referrer and direct traffic", () => {
    const rows = buildAttributionSourceRows([
      {
        event_name: "page_view",
        visitor_id: "visitor-google",
        session_id: "session-google",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google_ads",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: "crm software",
        utm_content: "hero",
        occurred_at: "2026-04-10T10:00:00.000Z",
      },
      {
        event_name: "lead_form_submit_success",
        visitor_id: "visitor-google",
        session_id: "session-google",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google_ads",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: "crm software",
        utm_content: "hero",
        occurred_at: "2026-04-10T10:03:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-linkedin",
        session_id: "session-linkedin",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: "https://www.linkedin.com/feed/",
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T11:00:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-direct",
        session_id: "session-direct",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T12:00:00.000Z",
      },
    ]);

    expect(rows[0]).toEqual(
      expect.objectContaining({
        sourceLabel: "Google",
        visitors: 1,
        conversions: 1,
        conversionRate: 100,
        attributionModel: "utm",
      }),
    );

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceLabel: "LinkedIn",
          visitors: 1,
          conversions: 0,
          attributionModel: "referrer",
        }),
        expect.objectContaining({
          sourceLabel: "Direto / nao identificado",
          visitors: 1,
          conversions: 0,
          attributionModel: "direct",
        }),
      ]),
    );
  });

  it("builds a campaign ranking with visitors, conversions and rate", () => {
    const campaigns = buildCampaignRanking([
      {
        event_name: "page_view",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: "crm software",
        utm_content: "hero-a",
        occurred_at: "2026-04-10T10:00:00.000Z",
      },
      {
        event_name: "lead_form_submit_success",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: "crm software",
        utm_content: "hero-a",
        occurred_at: "2026-04-10T10:05:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-2",
        session_id: "session-2",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: "crm automation",
        utm_content: "hero-b",
        occurred_at: "2026-04-10T10:08:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-3",
        session_id: "session-3",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: "https://www.linkedin.com/feed/",
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:10:00.000Z",
      },
    ]);

    expect(campaigns[0]).toEqual(
      expect.objectContaining({
        campaignLabel: "crm-q2",
        sourceLabel: "Google",
        mediumLabel: "Cpc",
        visitors: 2,
        conversions: 1,
        conversionRate: 50,
        termLabel: "Multiplos termos",
        contentLabel: "Multiplos conteudos",
        attributionStatus: "complete",
      }),
    );
    expect(campaigns[1]).toEqual(
      expect.objectContaining({
        campaignLabel: "Sem UTM / campanha",
        sourceLabel: "LinkedIn",
        mediumLabel: "Sem medio",
        visitors: 1,
        conversions: 0,
        conversionRate: 0,
        attributionStatus: "untagged",
      }),
    );
  });

  it("sorts campaign ranking by volume, conversion and worst performance", () => {
    const ranking = [
      {
        id: "google::cpc::crm-q2",
        campaignLabel: "crm-q2",
        sourceLabel: "Google",
        mediumLabel: "Cpc",
        termLabel: null,
        contentLabel: null,
        visitors: 20,
        conversions: 3,
        conversionRate: 15,
        attributionStatus: "complete" as const,
        attributionSummary: "UTM source, medium e campaign presentes",
      },
      {
        id: "linkedin::paid::crm-enterprise",
        campaignLabel: "crm-enterprise",
        sourceLabel: "LinkedIn",
        mediumLabel: "Paid",
        termLabel: null,
        contentLabel: null,
        visitors: 12,
        conversions: 5,
        conversionRate: 41.7,
        attributionStatus: "complete" as const,
        attributionSummary: "UTM source, medium e campaign presentes",
      },
      {
        id: "direct::sem_medio::sem_campanha",
        campaignLabel: "Sem UTM / campanha",
        sourceLabel: "Direto / nao identificado",
        mediumLabel: "Sem medio",
        termLabel: null,
        contentLabel: null,
        visitors: 18,
        conversions: 0,
        conversionRate: 0,
        attributionStatus: "untagged" as const,
        attributionSummary: "Trafego sem UTM de campanha no periodo",
      },
    ];

    expect(sortCampaignRanking(ranking, "highest_volume").map((item) => item.id)).toEqual([
      "google::cpc::crm-q2",
      "direct::sem_medio::sem_campanha",
      "linkedin::paid::crm-enterprise",
    ]);

    expect(sortCampaignRanking(ranking, "highest_conversion").map((item) => item.id)).toEqual([
      "linkedin::paid::crm-enterprise",
      "google::cpc::crm-q2",
      "direct::sem_medio::sem_campanha",
    ]);

    expect(sortCampaignRanking(ranking, "worst_performance").map((item) => item.id)).toEqual([
      "direct::sem_medio::sem_campanha",
      "google::cpc::crm-q2",
      "linkedin::paid::crm-enterprise",
    ]);
  });

  it("builds the acquisition funnel with advancement and drop-off rates", () => {
    const funnel = buildAcquisitionFunnel([
      {
        event_name: "page_view",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:00:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-2",
        session_id: "session-2",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "linkedin",
        utm_medium: "paid",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:02:00.000Z",
      },
      {
        event_name: "page_view",
        visitor_id: "visitor-3",
        session_id: "session-3",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:03:00.000Z",
      },
      {
        event_name: "cta_click",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:04:00.000Z",
      },
      {
        event_name: "cta_click",
        visitor_id: "visitor-2",
        session_id: "session-2",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "linkedin",
        utm_medium: "paid",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:05:00.000Z",
      },
      {
        event_name: "lead_form_start",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:06:00.000Z",
      },
      {
        event_name: "lead_form_submit_attempt",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:07:00.000Z",
      },
      {
        event_name: "lead_form_submit_success",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:08:00.000Z",
      },
      {
        event_name: "lead_form_submit_error",
        visitor_id: "visitor-2",
        session_id: "session-2",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: "linkedin",
        utm_medium: "paid",
        utm_campaign: "crm-q2",
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:09:00.000Z",
      },
    ]);

    expect(funnel.stages.map((stage) => stage.count)).toEqual([3, 2, 1, 1, 1]);
    expect(funnel.stages[1]).toEqual(
      expect.objectContaining({
        label: "Cliques em CTA",
        advanceRate: 66.7,
        dropOffRate: 33.3,
      }),
    );
    expect(funnel.stages[4]).toEqual(
      expect.objectContaining({
        label: "Envio com sucesso",
        advanceRate: 100,
        dropOffRate: 0,
      }),
    );
    expect(funnel.submitErrorCount).toBe(1);
    expect(funnel.bottleneck).toEqual(
      expect.objectContaining({
        fromStageLabel: "Cliques em CTA",
        toStageLabel: "Inicio de formulario",
      }),
    );
  });

  it("builds a single analytics snapshot for the dashboard composition", () => {
    const snapshot = buildAnalyticsDashboardSnapshot(
      [
        {
          event_name: "page_view",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm-q2",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T10:00:00.000Z",
        },
        {
          event_name: "lead_form_submit_success",
          visitor_id: "visitor-1",
          session_id: "session-1",
          page_path: "/",
          page_url: "https://example.com/",
          referrer: null,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "crm-q2",
          utm_term: null,
          utm_content: null,
          occurred_at: "2026-04-10T10:05:00.000Z",
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
      "30d",
    );

    expect(snapshot.kpis).toHaveLength(2);
    expect(snapshot.performance.length).toBeGreaterThan(0);
    expect(snapshot.attributionSources[0]).toEqual(
      expect.objectContaining({
        sourceLabel: "Google",
      }),
    );
    expect(snapshot.campaigns[0]).toEqual(
      expect.objectContaining({
        campaignLabel: "crm-q2",
      }),
    );
    expect(snapshot.funnel.stages[0]?.label).toBe("Visitantes");
    expect(snapshot.trafficLeadComparison.current).toBeDefined();
  });

  it("marks funnel stages as partial when later events exceed the previous stage", () => {
    const funnel = buildAcquisitionFunnel([
      {
        event_name: "page_view",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:00:00.000Z",
      },
      {
        event_name: "lead_form_start",
        visitor_id: "visitor-1",
        session_id: "session-1",
        page_path: "/",
        page_url: "https://example.com/",
        referrer: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        occurred_at: "2026-04-10T10:01:00.000Z",
      },
    ]);

    expect(funnel.hasPartialData).toBe(true);
    expect(funnel.stages[2]).toEqual(
      expect.objectContaining({
        label: "Inicio de formulario",
        hasPartialData: true,
        advanceRate: null,
        dropOffRate: null,
      }),
    );
  });

  it("builds an executive comparison between the first and second half of the window", () => {
    const comparison = buildTrafficLeadComparison([
      {
        date: "2026-04-01",
        label: "01/04",
        visitors: 40,
        leads: 4,
        conversions: 4,
        conversionRate: 10,
      },
      {
        date: "2026-04-02",
        label: "02/04",
        visitors: 35,
        leads: 3,
        conversions: 3,
        conversionRate: 8.6,
      },
      {
        date: "2026-04-03",
        label: "03/04",
        visitors: 70,
        leads: 3,
        conversions: 3,
        conversionRate: 4.3,
      },
      {
        date: "2026-04-04",
        label: "04/04",
        visitors: 65,
        leads: 4,
        conversions: 4,
        conversionRate: 6.2,
      },
    ]);

    expect(comparison.previous).toEqual(
      expect.objectContaining({
        label: "Metade inicial",
        visitors: 75,
        leads: 7,
        conversions: 7,
        conversionRate: 9.3,
      }),
    );
    expect(comparison.current).toEqual(
      expect.objectContaining({
        label: "Metade final",
        visitors: 135,
        leads: 7,
        conversions: 7,
        conversionRate: 5.2,
      }),
    );
    expect(comparison.delta).toEqual(
      expect.objectContaining({
        visitorsPercent: 80,
        leadsPercent: 0,
        conversionRatePoints: -4.1,
      }),
    );
    expect(comparison.insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "traffic_up_leads_flat",
          tone: "warning",
        }),
      ]),
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
