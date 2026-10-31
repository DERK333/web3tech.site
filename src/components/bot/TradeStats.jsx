import React from "react";
import { fmtMoney, fmtPct, pnlClass } from "@/lib/botFormat";

const Stat = ({ label, value, hint, className = "text-foreground" }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-xl font-bold ${className}`}>{value}</p>
    {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
  </div>
);

export default function TradeStats({ deals }) {
  const closed = deals.filter((deal) => deal.status !== "open");
  const open = deals.filter((deal) => deal.status === "open");
  const wins = closed.filter((deal) => Number(deal.realized_pct) > 0).length;
  const realized = closed.reduce((sum, deal) => sum + (Number(deal.realized) || 0), 0);
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Deals" value={deals.length} hint={`${open.length} still open`} />
      <Stat
        label="Win rate"
        value={winRate == null ? "—" : `${winRate}%`}
        hint={`${wins} of ${closed.length} closed`}
      />
      <Stat
        label="Realized P&L"
        value={closed.length ? fmtMoney(realized) : "—"}
        hint={closed.length ? "Across every closed deal" : "Nothing closed yet"}
        className={pnlClass(realized)}
      />
      <Stat
        label="Best deal"
        value={
          closed.length
            ? fmtPct(Math.max(...closed.map((deal) => Number(deal.realized_pct) || 0)))
            : "—"
        }
        hint="Largest gain booked"
        className="text-emerald-400"
      />
    </div>
  );
}