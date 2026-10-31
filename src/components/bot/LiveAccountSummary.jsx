import React, { useCallback, useEffect, useState } from "react";
import { Landmark, RefreshCw, Wallet, PieChart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtMoney } from "@/lib/botFormat";

function Card({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="mt-2 font-heading text-xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// Real broker balances straight from Kraken and Alpaca — never simulated.
export default function LiveAccountSummary({ positions = [] }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const response = await base44.functions.invoke("brokerStatus", {});
      setStatus(response?.data || null);
      setUpdatedAt(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, [refresh]);

  const krakenTotal = status?.kraken?.ok ? Number(status.kraken.total ?? status.kraken.cash) : null;
  const krakenCash = status?.kraken?.ok ? Number(status.kraken.cash) : null;
  const krakenCrypto = status?.kraken?.ok ? Number(status.kraken.crypto_value ?? 0) : 0;
  const alpacaEquity = status?.alpaca?.ok
    ? Number(status.alpaca.equity ?? status.alpaca.cash)
    : null;
  const known = [krakenTotal, alpacaEquity].filter((n) => Number.isFinite(n));
  const held = known.reduce((sum, n) => sum + n, 0);

  const realPositions = positions.filter((p) => p.venue && p.venue !== "paper");
  const realValue = realPositions.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.last_price ?? p.avg_cost ?? 0),
    0
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          icon={Landmark}
          label="Live portfolio"
          value={known.length ? fmtMoney(held) : "—"}
          hint="Kraken holdings + Alpaca equity"
        />
        <Card
          icon={Wallet}
          label="Kraken"
          value={krakenTotal == null ? "—" : fmtMoney(krakenTotal)}
          hint={
            !status
              ? "Reading the account…"
              : !status.kraken?.configured
                ? "Connect your Kraken key in Brokers"
                : status.kraken.error ||
                  (krakenTotal == null
                    ? "Reading the account…"
                    : `${fmtMoney(krakenCash)} USD cash · ${fmtMoney(krakenCrypto)} in crypto`)
          }
        />
        <Card
          icon={Wallet}
          label="Alpaca"
          value={alpacaEquity == null ? "—" : fmtMoney(alpacaEquity)}
          hint={
            !status
              ? "Reading the account…"
              : !status.alpaca?.configured
                ? "Connect your Alpaca key in Brokers"
                : status.alpaca.error ||
                  (status.alpaca.paper === false ? "Live account equity" : "Paper account equity")
          }
        />
        <Card
          icon={PieChart}
          label="Live positions"
          value={String(realPositions.length)}
          hint={`${fmtMoney(realValue)} held, included above`}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {loading && !status
            ? "Reading your broker accounts…"
            : updatedAt
              ? `Updated ${updatedAt.toLocaleTimeString()} · refreshes every minute`
              : ""}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}