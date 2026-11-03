import React from "react";
import { dayLabel } from "@/lib/marketInsights";
import { fmtMoney } from "@/lib/botFormat";

export default function DailyPerformanceTable({ days }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">Day</th>
            <th className="px-3 py-2 font-semibold">Scans</th>
            <th className="px-3 py-2 font-semibold">Trades</th>
            <th className="px-3 py-2 font-semibold">Equity</th>
            <th className="px-3 py-2 font-semibold">Change</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.day} className="border-b border-border/50 last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-foreground">{dayLabel(day.day)}</td>
              <td className="px-3 py-2 text-muted-foreground">{day.scans}</td>
              <td className="px-3 py-2 text-muted-foreground">{day.trades}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-foreground">
                {day.equity == null ? "—" : fmtMoney(day.equity)}
              </td>
              <td
                className={`whitespace-nowrap px-3 py-2 font-mono ${
                  day.change == null
                    ? "text-muted-foreground"
                    : day.change >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                }`}
              >
                {day.change == null
                  ? "—"
                  : `${day.change >= 0 ? "+" : "-"}${fmtMoney(Math.abs(day.change))}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}