import React from "react";
import { dayLabel } from "@/lib/marketInsights";

const TONE = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function DailyAnalysisList({ days }) {
  if (days.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No analysis yet — the first scan writes one.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {days.slice(0, 7).map((day) => (
        <article key={day.day} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {dayLabel(day.day)}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${
                TONE[day.last?.status] || TONE.ok
              }`}
            >
              {day.last?.status === "error"
                ? "Scan error"
                : day.last?.status === "partial"
                  ? "Partial"
                  : "Completed"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {day.last?.summary || "The bot ran but wrote no summary for this day."}
          </p>
          <p className="mt-2 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            {day.scans} scan{day.scans === 1 ? "" : "s"} · {day.trades} trade
            {day.trades === 1 ? "" : "s"} · {day.last?.assets_scanned ?? 0} assets scored
          </p>
        </article>
      ))}
    </div>
  );
}