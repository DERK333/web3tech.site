import React, { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RANGES = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "180D", value: 180 },
];

const CRYPTO_COLOR = "hsl(var(--accent))";
const STOCK_COLOR = "hsl(var(--primary))";

const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const tone = (value) => (Number(value) < 0 ? "text-red-400" : "text-primary");

function ReturnChip({ label, value, color }) {
  const up = Number(value) >= 0;
  return (
    <div className="flex-1 min-w-[8.125rem] rounded-lg border border-border/60 bg-secondary/30 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={`mt-0.5 flex items-center gap-1 font-heading text-lg font-bold tabular-nums ${tone(value)}`}>
        {value == null ? "—" : (
          <>
            {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {pct(value)}
          </>
        )}
      </p>
    </div>
  );
}

function MemberList({ title, members, color }) {
  if (!members?.length) return null;
  return (
    <div>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {members.map((m) => (
          <span
            key={m.symbol}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-2 py-0.5 text-[0.6875rem]"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono font-semibold text-foreground">{m.symbol}</span>
            <span className={`tabular-nums ${tone(m.return_pct)}`}>{pct(m.return_pct)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AssetClassTrend() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("assetTrends", { days: range });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not load the trend comparison.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const rows = (data?.labels || []).map((label, i) => ({
    label: format(parseISO(label), "MMM d"),
    crypto: data.crypto ? data.crypto[i] : null,
    stocks: data.stocks ? data.stocks[i] : null,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Crypto vs stocks</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Equal-weight move of your watchlist plus liquid benchmarks, both sides starting at 0%.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg border border-border/60 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={`rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors ${
                  days === r.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(days)}
            disabled={loading}
            className="rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : loading && !data ? (
        <div className="mt-4 flex h-56 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading market history…
        </div>
      ) : data ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <ReturnChip label="Crypto" value={data.crypto_return_pct} color={CRYPTO_COLOR} />
            <ReturnChip label="Stocks & ETFs" value={data.stock_return_pct} color={STOCK_COLOR} />
          </div>

          <div className="mt-4 h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${Number(v).toFixed(0)}%`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value, name) => [pct(value), name === "crypto" ? "Crypto" : "Stocks & ETFs"]}
                />
                <Line
                  type="monotone"
                  dataKey="crypto"
                  stroke={CRYPTO_COLOR}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="stocks"
                  stroke={STOCK_COLOR}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            <MemberList title="Crypto basket" members={data.crypto_members} color={CRYPTO_COLOR} />
            <MemberList title="Stock & ETF basket" members={data.stock_members} color={STOCK_COLOR} />
          </div>
        </>
      ) : null}
    </div>
  );
}