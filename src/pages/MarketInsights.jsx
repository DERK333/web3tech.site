import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InsightStats from "@/components/insights/InsightStats";
import DailyPerformanceTable from "@/components/insights/DailyPerformanceTable";
import DailyAnalysisList from "@/components/insights/DailyAnalysisList";
import MarketSnapshot from "@/components/insights/MarketSnapshot";
import { groupRunsByDay } from "@/lib/marketInsights";

const first = (value) => (Array.isArray(value) ? value[0] : value?.items?.[0]) || null;
const asArray = (value) => (Array.isArray(value) ? value : value?.items || []);

export default function MarketInsights() {
  const [config, setConfig] = useState(null);
  const [runs, setRuns] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const [configs, runPage, signalList] = await Promise.all([
          base44.entities.BotConfig.filter({ owner_id: me.id }),
          base44.entities.BotRun.filter(
            { owner_id: me.id, started_at: { $gte: since } },
            { sort: "-started_at", limit: 500 }
          ),
          base44.entities.BotSignal.list("-scanned_at", 100),
        ]);
        if (!active) return;
        setConfig(first(configs));
        setRuns(asArray(runPage));
        setSignals(asArray(signalList));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const days = useMemo(() => groupRunsByDay(runs), [runs]);
  const topSignals = useMemo(
    () =>
      [...signals]
        .sort(
          (a, b) => Number(b.expected_gain_pct ?? 0) - Number(a.expected_gain_pct ?? 0)
        )
        .slice(0, 6),
    [signals]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Daily intelligence</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
        Market insights
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        What the automated scan found, what it did, and how the portfolio moved — a day at a time.
      </p>

      {loading ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading your daily summaries…
        </div>
      ) : (
        <>
          <section className="mt-6">
            <InsightStats config={config} days={days} signals={signals} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Daily market analysis
            </h2>
            <DailyAnalysisList days={days} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Daily performance
            </h2>
            {days.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                No completed scans in the last 30 days.
              </p>
            ) : (
              <DailyPerformanceTable days={days.slice(0, 14)} />
            )}
          </section>

          <section className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Highest estimated gain right now
            </h2>
            <MarketSnapshot signals={topSignals} />
          </section>

          <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">
            Estimates are arithmetic projections from recent price behaviour, not forecasts. Nothing
            here is investment advice.
          </p>

          <Link
            to="/trading"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Open the market bot <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}