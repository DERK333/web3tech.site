import React from "react";
import { fmtMoney } from "@/lib/botFormat";

export default function InsightStats({ config, days, signals }) {
  const starting = Number(config?.starting_cash ?? 100000);
  const equity = days[0]?.equity ?? starting;
  const pnl = equity - starting;
  const weekScans = days
    .filter((d) => (Date.now() - new Date(`${d.day}T12:00:00`).getTime()) / 86400000 <= 7)
    .reduce((sum, d) => sum + d.scans, 0);

  const cards = [
    {
      label: "Equity",
      value: fmtMoney(equity),
      hint: config?.live_enabled ? "Includes live broker cash" : "Paper portfolio",
    },
    {
      label: "Since inception",
      value: `${pnl >= 0 ? "+" : "-"}${fmtMoney(Math.abs(pnl))}`,
      hint: `${((pnl / starting) * 100).toFixed(2)}% on ${fmtMoney(starting)}`,
      tone: pnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    { label: "Scans this week", value: String(weekScans), hint: "Every 30 minutes" },
    { label: "Signals tracked", value: String(signals.length), hint: "Latest scan snapshot" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {card.label}
          </p>
          <p className={`mt-2 font-heading text-xl font-bold ${card.tone || "text-foreground"}`}>
            {card.value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}