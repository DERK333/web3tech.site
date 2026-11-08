import React, { useState } from "react";
import { Ban, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const num = (value, suffix = "") =>
  value == null || value === "" ? "—" : `${Number(value).toFixed(1)}${suffix}`;

// What the bot looked at and turned down, and the exact rule that refused each
// one. The gate is only trustworthy if you can see the trades it did not take.
export default function PassedOnPanel({ run }) {
  const [expanded, setExpanded] = useState(false);
  const skipped = Array.isArray(run?.passed_on) ? run.passed_on : [];

  if (!run) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No scan recorded yet. Run a scan to see which setups the bot examines and why it
        passes on them.
      </div>
    );
  }

  if (!skipped.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        The last scan passed on nothing — every buy candidate it looked at either cleared the
        gate or was already held.
      </div>
    );
  }

  const shown = expanded ? skipped : skipped.slice(0, 4);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-semibold text-foreground">
            {skipped.length} setup{skipped.length === 1 ? "" : "s"} passed on
          </p>
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          {run.started_at ? new Date(run.started_at).toLocaleString() : "latest scan"}
        </p>
      </div>

      <ul className="divide-y divide-border">
        {shown.map((item) => (
          <li key={`${item.symbol}-${item.reason}`} className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {item.symbol}
                </span>
                <span className="rounded border border-border px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.asset_class || "asset"}
                </span>
              </div>
              <p className="font-mono text-[0.6875rem] text-muted-foreground">
                score {num(item.effective_score ?? item.score)} · gain{" "}
                {num(item.expected_gain_pct, "%")} · R/R {num(item.reward_risk)} · risk{" "}
                {num(item.risk_pct, "%")}
              </p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-400/90">{item.reason}</p>
          </li>
        ))}
      </ul>

      {skipped.length > 4 ? (
        <div className="border-t border-border px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            className="w-full justify-center gap-1.5 text-xs"
          >
            {expanded ? "Show fewer" : `Show all ${skipped.length}`}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}