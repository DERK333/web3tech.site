import React from "react";
import { fmtMoney, fmtQty, fmtPct, pnlClass } from "@/lib/botFormat";

export default function PositionsTable({ positions }) {
  if (!positions.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No open positions. The bot only buys when an asset scores above your entry threshold.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left font-medium px-4 py-2">Asset</th>
              <th className="text-right font-medium px-3 py-2">Units</th>
              <th className="text-right font-medium px-3 py-2">Avg cost</th>
              <th className="text-right font-medium px-3 py-2">Last</th>
              <th className="text-right font-medium px-3 py-2">Value</th>
              <th className="text-right font-medium px-4 py-2">P&amp;L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {positions.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5">
                  <p className="font-semibold text-foreground">{p.symbol}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.asset_class}</p>
                </td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtQty(p.quantity)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtMoney(p.avg_cost)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{fmtMoney(p.last_price)}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{fmtMoney(p.market_value)}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${pnlClass(p.unrealized_pct)}`}>
                  {fmtPct(p.unrealized_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}