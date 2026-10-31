import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney } from "@/lib/botFormat";

// Doubling-friendly bounds keep every half-step label a whole number.
const AXIS_BOUNDS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

const RANGES = [
  { key: "week", label: "Last week", days: 7 },
  { key: "month", label: "Last month", days: 30 },
];

// Each scan stores the portfolio's equity, so P&L over time is simply equity
// minus the starting balance. Only runs inside the chosen window are used.
function buildSeries(runs, startingCash, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return (runs || [])
    .filter((run) => run.started_at && Number.isFinite(Number(run.equity)))
    .filter((run) => new Date(run.started_at).getTime() >= cutoff)
    .sort((a, b) => new Date(a.started_at) - new Date(b.started_at))
    .map((run) => ({
      at: new Date(run.started_at).getTime(),
      pnl: Number(run.equity) - startingCash,
    }));
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{new Date(point.at).toLocaleString()}</p>
      <p className={`mt-0.5 font-semibold ${point.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
        {point.pnl >= 0 ? "+" : "-"}
        {fmtMoney(Math.abs(point.pnl))}
      </p>
    </div>
  );
}

export default function PnLChart({ runs, startingCash }) {
  const [range, setRange] = useState(RANGES[0]);

  const data = useMemo(
    () => buildSeries(runs, Number(startingCash) || 0, range.days),
    [runs, startingCash, range.days]
  );

  const latest = data.length ? data[data.length - 1].pnl : 0;
  const positive = latest >= 0;
  // Symmetric around zero so a small move still reads clearly and the zero line
  // always sits mid-chart. The bound is rounded to a clean number so the
  // axis labels are always even halves, never odd fractions.
  const peak = data.reduce((max, p) => Math.max(max, Math.abs(p.pnl)), 0) * 1.15;
  const bound = AXIS_BOUNDS.find((value) => value >= peak) ?? Math.ceil(peak / 10000) * 10000;
  const ticks = [-bound, -bound / 2, 0, bound / 2, bound];

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total profit &amp; loss
          </p>
          {data.length ? (
            <p className={`mt-1 text-2xl font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
              {positive ? "+" : "-"}
              {fmtMoney(Math.abs(latest))}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No scans in this period yet.</p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {data.length && latest === 0
              ? `Still level with your ${fmtMoney(Number(startingCash) || 0)} starting balance — the line moves once positions gain or lose value.`
              : `Portfolio value against your ${fmtMoney(Number(startingCash) || 0)} starting balance.`}
          </p>
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range.key === option.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {data.length > 1 ? (
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={positive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={positive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="at"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
                minTickGap={28}
              />
              <YAxis                domain={[-bound, bound]}
                ticks={ticks}
                tickFormatter={(value) => `${value >= 0 ? "+" : "-"}$${Math.abs(Math.round(value))}`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
                width={64}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke={positive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                fill="url(#pnlFill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Run a few scans and the {range.label.toLowerCase()} trend will appear here.
        </p>
      )}
    </div>
  );
}