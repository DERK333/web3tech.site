import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BrokerStatusCard from "@/components/connection/BrokerStatusCard";
import ScanPulse from "@/components/connection/ScanPulse";

const first = (value) => (Array.isArray(value) ? value[0] : value?.items?.[0]) || null;

export default function ConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const me = await base44.auth.me();
      const [configs, response] = await Promise.all([
        base44.entities.BotConfig.filter({ owner_id: me.id }),
        base44.functions.invoke("brokerStatus", {}),
      ]);
      setConfig(first(configs));
      setStatus(response?.data || null);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Could not reach the brokers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Connections</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Brokerage status
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Whether Kraken and Alpaca answer with your key, what they hold right now, and when the
            bot last finished a scan.
          </p>
        </div>
        <Button onClick={refresh} disabled={refreshing} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh connections"}
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Checking your broker connections…
        </div>
      ) : (
        <>
          {error ? (
            <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </p>
          ) : null}

          <section className="mt-6">
            <ScanPulse config={config} />
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <BrokerStatusCard title="Kraken" kind="kraken" data={status?.kraken} />
            <BrokerStatusCard title="Alpaca" kind="alpaca" data={status?.alpaca} />
          </section>

          <p className="mt-3 text-[11px] text-muted-foreground">
            {updatedAt ? `Checked ${updatedAt.toLocaleTimeString()}. ` : ""}
            Connections are read-only — nothing here places an order.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Keys
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Add or replace keys in the Brokers panel on the{" "}
              <Link to="/trading" className="font-semibold text-primary hover:underline">
                market bot
              </Link>{" "}
              page. Keys are stored encrypted and never sent back to a browser.
            </p>
          </div>
        </>
      )}
    </div>
  );
}