import {
  AnalyticsAttributionContext,
  AnalyticsEventRecord,
  TrackAnalyticsEventInput,
} from "@/types/analytics";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ANALYTICS_ENDPOINT = import.meta.env.VITE_SUPABASE_ANALYTICS_URL || `${SUPABASE_URL}/rest/v1/analytics_events`;

const VISITOR_KEY = "landing.analytics.visitor-id.v1";
const SESSION_KEY = "landing.analytics.session-id.v1";
const ATTRIBUTION_KEY = "landing.analytics.attribution.v1";
const QUEUE_KEY = "landing.analytics.queue.v1";

let hasWarnedAboutAnalyticsConfig = false;
let flushPromise: Promise<void> | null = null;
type IdleCallback = (callback: () => void, options?: { timeout: number }) => number;

export function trackAnalyticsEvent({ eventName, payload = {} }: TrackAnalyticsEventInput) {
  if (!canUseAnalytics()) {
    return;
  }

  const context = getAttributionContext();
  const event = buildEventRecord(eventName, context, payload);
  const queue = readQueue();

  writeQueue([...queue, event]);
  scheduleFlush();
}

export function trackPageView(payload: Record<string, unknown> = {}) {
  trackAnalyticsEvent({ eventName: "page_view", payload });
}

export function getAttributionSnapshot() {
  if (!canUseAnalytics()) {
    return null;
  }

  return getAttributionContext();
}

export function flushAnalyticsQueue() {
  if (!canUseAnalytics()) {
    return Promise.resolve();
  }

  if (flushPromise) {
    return flushPromise;
  }

  flushPromise = sendQueuedEvents().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
}

function scheduleFlush() {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as Window & typeof globalThis & { requestIdleCallback?: IdleCallback };

  if (typeof analyticsWindow.requestIdleCallback === "function") {
    analyticsWindow.requestIdleCallback(() => {
      void flushAnalyticsQueue();
    }, { timeout: 1200 });
    return;
  }

  window.setTimeout(() => {
    void flushAnalyticsQueue();
  }, 0);
}

async function sendQueuedEvents() {
  const queue = readQueue();

  if (queue.length === 0) {
    return;
  }

  const batch = queue.slice(0, 20);

  try {
    const response = await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`Analytics endpoint respondeu com status ${response.status}.`);
    }

    writeQueue(queue.slice(batch.length));

    if (queue.length > batch.length) {
      scheduleFlush();
    }
  } catch (error) {
    console.warn("Analytics event delivery failed:", error);
  }
}

function buildEventRecord(
  eventName: TrackAnalyticsEventInput["eventName"],
  context: AnalyticsAttributionContext,
  payload: Record<string, unknown>,
): AnalyticsEventRecord {
  return {
    event_name: eventName,
    visitor_id: context.visitorId,
    session_id: context.sessionId,
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: context.referrer,
    utm_source: context.utmSource,
    utm_medium: context.utmMedium,
    utm_campaign: context.utmCampaign,
    utm_term: context.utmTerm,
    utm_content: context.utmContent,
    occurred_at: new Date().toISOString(),
    event_payload: payload,
  };
}

function getAttributionContext(): AnalyticsAttributionContext {
  const storedContext = readStoredAttribution();
  const currentContext = createAttributionContext();

  if (!storedContext) {
    storeAttribution(currentContext);
    return currentContext;
  }

  const mergedContext = mergeAttributionContexts(storedContext, currentContext);
  storeAttribution(mergedContext);
  return mergedContext;
}

function createAttributionContext(): AnalyticsAttributionContext {
  const params = new URLSearchParams(window.location.search);

  return {
    visitorId: readOrCreateStorageValue(localStorage, VISITOR_KEY),
    sessionId: readOrCreateStorageValue(sessionStorage, SESSION_KEY),
    landingPath: window.location.pathname,
    landingUrl: window.location.href,
    referrer: document.referrer || null,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmTerm: params.get("utm_term"),
    utmContent: params.get("utm_content"),
    capturedAt: new Date().toISOString(),
  };
}

function mergeAttributionContexts(
  storedContext: AnalyticsAttributionContext,
  currentContext: AnalyticsAttributionContext,
): AnalyticsAttributionContext {
  return {
    visitorId: storedContext.visitorId || currentContext.visitorId,
    sessionId: currentContext.sessionId,
    landingPath: storedContext.landingPath || currentContext.landingPath,
    landingUrl: storedContext.landingUrl || currentContext.landingUrl,
    referrer: storedContext.referrer || currentContext.referrer,
    utmSource: storedContext.utmSource || currentContext.utmSource,
    utmMedium: storedContext.utmMedium || currentContext.utmMedium,
    utmCampaign: storedContext.utmCampaign || currentContext.utmCampaign,
    utmTerm: storedContext.utmTerm || currentContext.utmTerm,
    utmContent: storedContext.utmContent || currentContext.utmContent,
    capturedAt: storedContext.capturedAt || currentContext.capturedAt,
  };
}

function canUseAnalytics() {
  if (typeof window === "undefined") {
    return false;
  }

  const isConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

  if (!isConfigured && !hasWarnedAboutAnalyticsConfig) {
    console.warn("Analytics disabled: missing Supabase environment variables for event capture.");
    hasWarnedAboutAnalyticsConfig = true;
  }

  return isConfigured;
}

function readStoredAttribution() {
  try {
    const rawValue = localStorage.getItem(ATTRIBUTION_KEY);
    return rawValue ? (JSON.parse(rawValue) as AnalyticsAttributionContext) : null;
  } catch {
    return null;
  }
}

function storeAttribution(context: AnalyticsAttributionContext) {
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(context));
  } catch {
    // Storage can fail in privacy mode. Tracking remains best-effort.
  }
}

function readQueue() {
  try {
    const rawValue = localStorage.getItem(QUEUE_KEY);
    return rawValue ? (JSON.parse(rawValue) as AnalyticsEventRecord[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: AnalyticsEventRecord[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-100)));
  } catch {
    // Ignore storage pressure and keep conversion flow non-blocking.
  }
}

function readOrCreateStorageValue(storage: Storage, key: string) {
  try {
    const existingValue = storage.getItem(key);

    if (existingValue) {
      return existingValue;
    }

    const nextValue = createTrackingId();
    storage.setItem(key, nextValue);
    return nextValue;
  } catch {
    return createTrackingId();
  }
}

function createTrackingId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
