import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, RefreshCw, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PortfolioSummary from "@/components/bot/PortfolioSummary";
import SignalBoard from "@/components/bot/SignalBoard";
import PositionsTable from "@/components/bot/PositionsTable";
import TradeLog from "@/components/bot/TradeLog";
import WatchlistManager from "@/components/bot/WatchlistManager";
import StrategyPanel from "@/components/bot/StrategyPanel";
import BrokerPanel from "@/components/bot/BrokerPanel";
import LearningPanel from "@/components/bot/LearningPanel";

const asArray = (value) => (Array.isArray(value) ? value : value?.items || []);

export default function TradingBot() {
  const { toast } = useToast();
  const [config, setConfig] = useState(null);
  const [signals, setSignals] = useState([]);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const [configs, liveSignals, openPositions, recentTrades, watchlist] = await Promise.all([
      base44.entities.BotConfig.list("-created_date", 1),
      base44.entities.BotSignal.list("-score", 100),
      base44.entities.BotPosition.list(),
      base44.entities.BotTrade.list("-created_date", 30),
      base44.entities.BotAsset.list("symbol", 100),
    ]);

    setConfig(asArray(configs)[0] || null);
    setSignals(asArray(liveSignals));
    setPositions(asArray(openPositions));
    setTrades(asArray(recentTrades));
    setAssets(asArray(watchlist));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const runScan = async () => {
    setRunning(true);
    try {
      const response = await base44.functions.invoke("runMarketBot", { force: true });
      const data = response?.data || {};
      if (data.status === "ok" || data.status === "partial") {
        toast({ title: "Scan complete", description: data.summary });
      } else {
        toast({ title: "Scan skipped", description: data.message || "Nothing to do right now." });
      }
      await load();
    } catch (error) {
      toast({
        title: "Scan failed",
        description: error?.response?.data?.error || error.message || "The bot could not finish its scan.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Automated trading</p>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Market Bot</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Scans stocks, ETFs and crypto every hour, scores each one on trend, momentum, RSI and
            volatility, then routes qualifying orders to Kraken and Alpaca — or keeps them simulated
            until you switch live trading on.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              config?.live_enabled
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            {config?.live_enabled ? "Live trading" : "Paper trading"}
          </span>
          <Button onClick={runScan} disabled={running} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${running ? "animate-spin" : ""}`} />
            {running ? "Scanning markets…" : "Run scan now"}
          </Button>
        </div>
      </div>

      {config?.last_scan_at ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Last scan {new Date(config.last_scan_at).toLocaleString()} — {config.last_summary}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading the bot's portfolio…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <PortfolioSummary config={config} positions={positions} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Signals</h2>
                <SignalBoard signals={signals} />
              </section>

              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Open positions</h2>
                <PositionsTable positions={positions} />
              </section>

              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="font-heading text-lg font-semibold text-foreground">Trade log</h2>
                  <Link
                    to="/trades"
                    className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                  >
                    Full trade history
                  </Link>
                </div>
                <TradeLog trades={trades} />
              </section>
            </div>

            <aside className="space-y-6">
              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Brokers</h2>
                <BrokerPanel config={config} onSaved={load} />
              </section>

              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Watchlist</h2>
                <WatchlistManager assets={assets} onChanged={load} />
              </section>

              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Strategy</h2>
                <StrategyPanel config={config} onSaved={load} />
              </section>

              <section>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Learning</h2>
                <LearningPanel config={config} trades={trades} onSaved={load} />
              </section>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Read this first
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  With live trading off, every order is simulated. With it on, orders are sent to your
                  Kraken and Alpaca accounts and spend real money — only your per-order cap and cash
                  reserve limit the damage. The scores are technical measurements, not predictions,
                  and no strategy can guarantee profit or avoid loss. Nothing here is investment advice.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}