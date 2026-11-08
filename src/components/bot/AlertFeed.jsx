import React, { useState } from "react";
import { Activity, Bell, Gauge, Target, TrendingDown, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";

const SEVERITY_BOX = {
  critical: "border-red-500/30 bg-red-500/[0.06]",
  warning: "border-amber-500/30 bg-amber-500/[0.06]",
  info: "border-border bg-card",
};

const SEVERITY_TEXT = {
  critical: "text-red-400",
  warning: "text-amber-400",
  info: "text-primary",
};

function AlertIcon({ kind, value }) {
  if (kind === "sma_cross") {
    return Number(value) >= 0 ? (
      <TrendingUp className="w-3.5 h-3.5" />
    ) : (
      <TrendingDown className="w-3.5 h-3.5" />
    );
  }
  if (kind === "volatility") return <Gauge className="w-3.5 h-3.5" />;
  if (kind === "price_move") return <Activity className="w-3.5 h-3.5" />;
  if (kind === "perp_setup") return <Target className="w-3.5 h-3.5" />;
  return <Bell className="w-3.5 h-3.5" />;
}

export default function AlertFeed({ alerts, onChanged }) {
  const [busy, setBusy] = useState(false);
  const unread = alerts.filter((a) => a.seen !== true);

  const markAllRead = async () => {
    if (unread.length === 0) return;
    setBusy(true);
    try {
      await base44.entities.BotAlert.bulkUpdate(unread.map((a) => ({ id: a.id, seen: true })));
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          No alerts yet. Every scan checks each enabled watchlist asset for a sharp price move, a
          cross of its 50-day average, a volatility spike or an RSI extreme.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <span
          className={`text-[0.6875rem] font-semibold uppercase tracking-wide ${
            unread.length ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {unread.length ? `${unread.length} new` : "All read"}
        </span>
        {unread.length ? (
          <button
            type="button"
            onClick={markAllRead}
            disabled={busy}
            className="text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors"
          >
            {busy ? "Marking…" : "Mark all read"}
          </button>
        ) : null}
      </div>

      <div className="mt-2 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-2.5 ${SEVERITY_BOX[alert.severity] || SEVERITY_BOX.info} ${
              alert.seen ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 shrink-0 ${SEVERITY_TEXT[alert.severity] || SEVERITY_TEXT.info}`}>
                <AlertIcon kind={alert.kind} value={alert.value} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">{alert.message}</p>
                <p className="mt-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  {alert.triggered_at
                    ? formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })
                    : ""}
                  {alert.seen ? " · read" : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}