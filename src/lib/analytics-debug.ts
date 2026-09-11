/**
 * Lightweight recorder for GA4 events fired through window.gtag.
 * Used only by the /analytics-debug page. Never imported by production surfaces.
 *
 * Once installed it stays installed for the rest of the browsing session, so you
 * can leave the debug page, click WhatsApp buttons around the site, and come back
 * to see exactly what was sent.
 */

export type RecordedEvent = {
  id: string;
  name: string;
  params: Record<string, unknown>;
  at: number;
  path: string;
};

const STORAGE_KEY = "ga4-debug-events";
const MAX_EVENTS = 100;

type Listener = (events: RecordedEvent[]) => void;
const listeners = new Set<Listener>();

let installed = false;

export function readEvents(): RecordedEvent[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecordedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: RecordedEvent[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    /* storage full or unavailable — recording is best effort */
  }
  listeners.forEach((l) => l(events));
}

export function clearEvents() {
  writeEvents([]);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function record(name: string, params: Record<string, unknown>) {
  const event: RecordedEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    params,
    at: Date.now(),
    path: window.location.pathname,
  };
  writeEvents([event, ...readEvents()]);
}

/** Wraps window.gtag so every call is recorded and still forwarded to GA4. */
export function installRecorder() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  try {
    sessionStorage.setItem("ga4-debug-armed", "1");
  } catch {
    /* storage unavailable */
  }


  const original = window.gtag;

  const wrapped = (...args: unknown[]) => {
    if (args[0] === "event" && typeof args[1] === "string") {
      record(args[1], (args[2] as Record<string, unknown>) || {});
    }
    original?.(...args);
  };

  window.gtag = wrapped as typeof window.gtag;
}

/** True when the real GA4 library (gtag.js) has loaded on this page. */
export function isGaLoaded(): boolean {
  if (typeof window === "undefined") return false;
  return Array.isArray(window.dataLayer) && typeof window.gtag === "function";
}
