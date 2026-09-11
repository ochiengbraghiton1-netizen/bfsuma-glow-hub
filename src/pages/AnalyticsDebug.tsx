import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Trash2, ExternalLink } from "lucide-react";
import {
  installRecorder,
  subscribe,
  readEvents,
  clearEvents,
  stopRecording,
  isGaLoaded,
  type RecordedEvent,
} from "@/lib/analytics-debug";
import { trackWhatsAppClick, trackViewItem } from "@/lib/analytics";

const MEASUREMENT_ID = "G-5S6XHDLTPF";

const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const AnalyticsDebug = () => {
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const [gaReady, setGaReady] = useState(false);
  const [gtmPresent, setGtmPresent] = useState(false);

  useEffect(() => {
    document.title = "Analytics Debug | BF SUMA Royal";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const hadMeta = Boolean(meta);
    const previous = meta?.content;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    return () => {
      if (!meta) return;
      if (hadMeta && previous !== undefined) meta.content = previous;
      else meta.remove();
    };
  }, []);

  useEffect(() => {
    installRecorder();
    setEvents(readEvents());
    const unsubscribe = subscribe(setEvents);

    const check = () => {
      setGaReady(isGaLoaded());
      setGtmPresent(
        Array.from(document.querySelectorAll("script")).some((s) =>
          (s.getAttribute("src") || "").includes("googletagmanager.com/gtm.js"),
        ),
      );
    };
    check();
    const interval = setInterval(check, 2000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const counts = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, e) => {
      acc[e.name] = (acc[e.name] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Analytics check</h1>
          <p className="text-sm text-muted-foreground">
            Every event this site sends to Google Analytics is listed below as it happens. Recording
            starts the moment you open this page and keeps running while you use the site in this tab,
            even across refreshes. Browse around, click a WhatsApp button or open a product, then come
            back here to see exactly what was recorded.
          </p>
        </header>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {gaReady ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              {gaReady
                ? `Google Analytics is loaded (${MEASUREMENT_ID})`
                : "Google Analytics has not loaded on this page"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {gtmPresent ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            )}
            <span>
              {gtmPresent
                ? "Tag Manager is present, which can double count clicks"
                : "No Tag Manager present, so no double counting"}
            </span>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Send a test event</h2>
          <p className="text-sm text-muted-foreground">
            These fire the exact same code the real buttons use. Each press should add one row below.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => trackWhatsAppClick("Test Product", "analytics_debug")}
            >
              Test WhatsApp click
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                trackViewItem({
                  item_id: "test-product",
                  item_name: "Test Product",
                  price: 7000,
                  currency: "KES",
                })
              }
            >
              Test product view
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/products">
                Browse products <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                stopRecording();
                clearEvents();
              }}
            >
              Stop recording
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Recorded events ({events.length})</h2>
            <Button size="sm" variant="ghost" onClick={clearEvents} disabled={!events.length}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>

          {Object.keys(counts).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(counts).map(([name, count]) => (
                <Badge key={name} variant="secondary">
                  {name}: {count}
                </Badge>
              ))}
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing recorded yet. Press a test button above, or browse the site in another tab.
            </p>
          ) : (
            <ul className="divide-y">
              {events.map((e) => (
                <li key={e.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{e.name}</span>
                    <span className="text-xs text-muted-foreground">{fmtTime(e.at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground break-words">{e.path}</div>
                  <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                    {JSON.stringify(e.params, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <p className="text-xs text-muted-foreground">
          This page only shows what your own browser sent. Confirm the same events in the Google
          Analytics realtime report to be sure they arrived.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDebug;
