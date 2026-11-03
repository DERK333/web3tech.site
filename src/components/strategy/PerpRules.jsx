import React from "react";

// Only liquid majors are considered at all — a thin pair is never a perp idea,
// however good its chart looks.
const MAJORS = "BTC, ETH, SOL, XRP, DOGE, ADA, AVAX, LINK, LTC, BCH, DOT, ATOM, NEAR, APT, SUI, ARB, OP, TON, TRX, XLM, HYPE";

const LEVERAGE = [
  { vol: "Under 60%", leverage: "3x", note: "Calmest majors" },
  { vol: "60–90%", leverage: "2x", note: "Normal crypto swings" },
  { vol: "90%+", leverage: "1x", note: "Stop would be too wide to lever" },
];

export default function PerpRules() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Before a coin is even considered
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>Liquid majors only — {MAJORS}.</li>
          <li>Annualized volatility must be under 150%; wilder charts are skipped.</li>
          <li>The board keeps the top four per side, six setups in total, ranked by conviction.</li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Long candidate
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>Signal is buy or strong buy</li>
            <li>Score at least 58</li>
            <li>20-day momentum positive</li>
          </ul>
        </div>
        <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
            Short candidate
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>Score 55 or below</li>
            <li>Momentum between −3% and −30% over 20 days</li>
            <li>RSI(14) between 20 and 55</li>
          </ul>
        </div>
      </div>

      <p>
        A coin already in free fall with an RSI in the teens is not a short — that is chasing a
        move that is about to bounce. The bot waits for an early rollover instead.
      </p>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Conviction
        </p>
        <p className="mt-1 font-mono text-xs text-foreground">
          long = score · short = 100 − score
        </p>
        <p className="mt-1 text-xs">
          An alert fires when conviction reaches your threshold — 70 by default. Each symbol and
          direction can alert once per 12 hours, so a setup that stays on the board does not page you
          on every scan.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="py-1.5 pr-3 font-semibold">Volatility</th>
              <th className="py-1.5 pr-3 font-semibold">Suggested</th>
              <th className="py-1.5 font-semibold">Why</th>
            </tr>
          </thead>
          <tbody>
            {LEVERAGE.map((row) => (
              <tr key={row.vol} className="border-b border-border/50 last:border-0">
                <td className="py-1.5 pr-3 text-foreground">{row.vol}</td>
                <td className="py-1.5 pr-3 font-mono text-primary">{row.leverage}</td>
                <td className="py-1.5">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}