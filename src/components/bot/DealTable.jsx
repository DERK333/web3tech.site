import React from "react";
import { fmtMoney, fmtQty, fmtPct, pnlClass } from "@/lib/botFormat";
import { fmtDealDate } from "@/lib/deals";

const outcome = (deal) => {
  if (deal.status === "open") return { label: "Open", className: "text-muted-foreground" };
  if (deal.realized_pct == null) return { label: "Closed", className: "text-muted-foreground" };
  return { label: fmtPct(deal.realized_pct), className: pnlClass(deal.realized_pct) };
};

const StatusBadge = ({ deal }) => {
  const label = deal.status === "open" ? "Open" : deal.status === "partial" ? "Partly closed" : "Closed";
  const className =
    deal.status === "open"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
      : "border-border bg-secondary/60 text-muted-foreground";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
};

export default function DealTable({ deals, emptyMessage }) {
  if (!deals.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground sm:p-8">
        {emptyMessage ||
          "Every entry the bot opens appears here with its entry price, and fills in the final outcome once the position closes."}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Desktop table */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Asset</th>
            <th className="px-4 py-3 text-right font-medium">Entry price</th>
            <th className="px-4 py-3 text-right font-medium">Exit price</th>
            <th className="px-4 py-3 text-right font-medium">Units</th>
            <th className="px-4 py-3 text-right font-medium">Outcome</th>
            <th className="px-4 py-3 text-right font-medium">Venue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {deals.map((deal) => {
            const result = outcome(deal);
            return (
              <tr key={deal.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{deal.symbol}</span>
                    <StatusBadge deal={deal} />
                  </div>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {deal.asset_class || "asset"}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-medium text-foreground">
                    {deal.entry_price == null ? "—" : fmtMoney(deal.entry_price)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{fmtDealDate(deal.entry_at)}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-medium text-foreground">
                    {deal.exit_price == null ? "Still open" : fmtMoney(deal.exit_price)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {deal.exit_at ? fmtDealDate(deal.exit_at) : "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{fmtQty(deal.quantity)}</td>
                <td className="px-4 py-3 text-right">
                  <p className={`font-semibold ${result.className}`}>{result.label}</p>
                  <p className={`text-[11px] ${result.className}`}>
                    {deal.realized == null ? "" : fmtMoney(deal.realized)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {deal.venue}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="divide-y divide-border/60 md:hidden">
        {deals.map((deal) => {
          const result = outcome(deal);
          return (
            <div key={deal.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{deal.symbol}</span>
                  <StatusBadge deal={deal} />
                </div>
                <span className={`text-sm font-semibold ${result.className}`}>{result.label}</span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Entry</dt>
                  <dd className="text-foreground">
                    {deal.entry_price == null ? "—" : fmtMoney(deal.entry_price)}
                    <span className="ml-1 text-muted-foreground">{fmtDealDate(deal.entry_at)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Exit</dt>
                  <dd className="text-foreground">
                    {deal.exit_price == null ? "Still open" : fmtMoney(deal.exit_price)}
                    <span className="ml-1 text-muted-foreground">{fmtDealDate(deal.exit_at)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Units</dt>
                  <dd className="text-muted-foreground">{fmtQty(deal.quantity)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Venue</dt>
                  <dd className="text-muted-foreground">{deal.venue}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}