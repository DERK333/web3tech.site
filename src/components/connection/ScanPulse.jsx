import React from "react";
import { Link } from "react-router-dom";
import { Clock, Radio } from "lucide-react";

function lastScanLabel(stamp) {
  if (!stamp) return "Never";
  const minutes = Math.round((Date.now() - new Date(stamp).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export default function ScanPulse({ config }) {
  const stamp = config?.last_scan_at;
  const ageMin = stamp ? (Date.now() - new Date(stamp).getTime()) / 60000 : null;
  const state =
    ageMin == null
      ? { label: "No scan yet", tone: "border-border bg-secondary text-muted-foreground" }
      : ageMin <= 45
        ? { label: "Scanning on schedule", tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" }
        : ageMin <= 60 * 24
          ? { label: "Scan overdue", tone: "border-amber-500/30 bg-amber-500/10 text-amber-400" }
          : { label: "Has not scanned in a day", tone: "border-red-500/30 bg-red-500/10 text-red-400" };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">Market scan</h3>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${state.tone}`}
        >
          {state.label}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <p className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Last scan: {lastScanLabel(stamp)}
        </p>
        <p>Cadence: every 30 minutes</p>
        <p>Mode: {config?.live_enabled ? "Live orders enabled" : "Paper only"}</p>
        <p>
          Universe:{" "}
          {config?.scan_total ? `${Number(config.scan_total).toLocaleString()} assets` : "not measured yet"}
        </p>
      </div>

      {config?.last_summary ? (
        <p className="mt-3 border-t border-border/60 pt-2 text-xs leading-relaxed text-muted-foreground">
          {config.last_summary}
        </p>
      ) : null}

      <Link
        to="/trading"
        className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
      >
        Manage brokers and run a scan →
      </Link>
    </div>
  );
}