import React from "react";

const ACTION_TONE = {
  strong_buy: "text-emerald-400",
  buy: "text-emerald-300",
  hold: "text-muted-foreground",
  trim: "text-amber-400",
  avoid: "text-red-400",
};

const pct = (value) => `${Number(value) >= 0 ? "+" : ""}${Number(value ?? 0).toFixed(1)}%`;

export default function MarketSnapshot({ signals }) {
  if (signals.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No signals stored yet — run a scan on the market bot page.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
      {signals.map((signal) => (
        <div key={signal.id || signal.symbol} className="flex items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-foreground">
              {signal.symbol}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {signal.asset_class} · {String(signal.action || "").replace("_", " ")}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-mono text-xs ${ACTION_TONE[signal.action] || "text-foreground"}`}>
              score {signal.score}
            </p>
            <p className="text-[10px] text-muted-foreground">
              20d {pct(signal.momentum_20d_pct)}
            </p>
          </div>
          <div className="w-16 text-right">
            <p
              className={`font-mono text-xs ${
                Number(signal.expected_gain_pct) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {pct(signal.expected_gain_pct)}
            </p>
            <p className="text-[10px] text-muted-foreground">est. 10d</p>
          </div>
        </div>
      ))}
    </div>
  );
}