import React, { useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fmtMoney, fmtPct, pnlClass, actionMeta, scoreClass } from "@/lib/botFormat";

export default function SignalBoard({ signals }) {
  const [expanded, setExpanded] = useState(null);

  if (!signals.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No signals yet — run a scan to study the watchlist.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="divide-y divide-border/60">
        {signals.map((signal) => {
          const meta = actionMeta(signal.action);
          const open = expanded === signal.symbol;
          const mom = Number(signal.momentum_20d_pct);
          return (
            <div key={signal.symbol}>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : signal.symbol)}
                className="w-full text-left px-4 py-3 hover:bg-secondary/40 transition-colors"
                aria-expanded={open}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[92px]">
                    <p className="font-semibold text-foreground text-sm">{signal.symbol}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {signal.asset_class}
                    </p>
                  </div>

                  <div className="min-w-[86px] text-sm text-muted-foreground">
                    {fmtMoney(signal.price)}
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreClass(signal.score)}`}
                        style={{ width: `${Math.max(4, Math.min(100, Number(signal.score)))}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{signal.score}</span>
                  </div>

                  <span className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${meta.className}`}>
                    {meta.label}
                  </span>

                  <span className={`hidden sm:flex items-center gap-1 text-xs ${pnlClass(mom)}`}>
                    {Number.isFinite(mom) && mom >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Number.isFinite(mom) ? fmtPct(mom) : "—"} 20d
                  </span>

                  <span className="hidden md:inline text-xs text-muted-foreground ml-auto">
                    RSI {signal.rsi14 ?? "—"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {open && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">{signal.rationale}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span>vs 50d: {signal.sma50_gap_pct == null ? "—" : fmtPct(signal.sma50_gap_pct)}</span>
                    <span>vs 200d: {signal.sma200_gap_pct == null ? "—" : fmtPct(signal.sma200_gap_pct)}</span>
                    <span>60d: {signal.momentum_60d_pct == null ? "—" : fmtPct(signal.momentum_60d_pct)}</span>
                    <span>volatility: {signal.volatility_pct == null ? "—" : `${signal.volatility_pct}%`}</span>
                    <span>scanned: {signal.scanned_at ? new Date(signal.scanned_at).toLocaleString() : "—"}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}