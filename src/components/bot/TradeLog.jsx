import React from "react";
import { fmtMoney, fmtQty, fmtPct, pnlClass } from "@/lib/botFormat";

export default function TradeLog({ trades }) {
  if (!trades.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No trades yet. Every fill the bot makes will appear here with its venue and reason.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
      {trades.map((t) => (
        <div key={t.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-semibold uppercase rounded px-1.5 py-0.5 ${
                t.side === "buy"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {t.side}
            </span>
            <span className="text-sm font-semibold text-foreground">{t.symbol}</span>
            <span className="text-xs text-muted-foreground">
              {fmtQty(t.quantity)} @ {fmtMoney(t.price)}
            </span>
            <span className="text-xs font-medium text-foreground ml-auto">
              {fmtMoney(t.notional)}
            </span>
          </div>
          {t.reason ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{t.reason}</p>
          ) : null}
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {t.executed_at ? new Date(t.executed_at).toLocaleString() : ""} · {t.venue || "paper"}
            {t.realized_pct != null ? (
              <span className={pnlClass(t.realized_pct)}> · booked {fmtPct(t.realized_pct)}</span>
            ) : null}
          </p>
        </div>
      ))}
    </div>
  );
}