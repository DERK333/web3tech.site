import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { fmtMoney } from "@/lib/botFormat";

function ConnectionRow({ name, detail, status }) {
  const tone = !status?.configured
    ? "bg-muted-foreground/40"
    : status.ok
      ? "bg-emerald-400"
      : "bg-red-400";
  const label = !status?.configured
    ? "Keys missing"
    : status.ok
      ? "Connected"
      : status.error || "Connection error";

  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${tone}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground text-right">{label}</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {detail}
          {status?.ok && status.cash != null ? ` · ${fmtMoney(status.cash)} available` : ""}
        </p>
      </div>
    </div>
  );
}

export default function BrokerPanel({ config, onSaved }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [live, setLive] = useState(false);
  const [alpacaPaper, setAlpacaPaper] = useState(true);
  const [values, setValues] = useState({ max_order_usd: "", min_cash_reserve_pct: "" });

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("brokerStatus", {});
      setStatus(response?.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (!config) return;
    setLive(config.live_enabled === true);
    setAlpacaPaper(config.alpaca_paper !== false);
    setValues({
      max_order_usd: String(config.max_order_usd ?? 100),
      min_cash_reserve_pct: String(config.min_cash_reserve_pct ?? 20),
    });
  }, [config]);

  const toggleLive = (next) => {
    if (next) {
      const ok = window.confirm(
        "Turn on live trading? From the next scan, qualifying crypto orders go to your Kraken account and stock/ETF orders go to Alpaca with real money."
      );
      if (!ok) return;
    }
    setLive(next);
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await base44.entities.BotConfig.update(config.id, {
        live_enabled: live,
        mode: live ? "live" : "paper",
        alpaca_paper: alpacaPaper,
        max_order_usd: Number(values.max_order_usd) || 100,
        min_cash_reserve_pct: Number(values.min_cash_reserve_pct) || 0,
      });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {loading && !status ? (
        <p className="text-xs text-muted-foreground">Checking broker connections…</p>
      ) : (
        <div className="divide-y divide-border/60">
          <ConnectionRow
            name="Kraken"
            detail="Crypto"
            status={status?.kraken}
          />
          <ConnectionRow
            name="Alpaca"
            detail={status?.alpaca?.paper === false ? "Stocks & ETFs · live account" : "Stocks & ETFs · paper account"}
            status={status?.alpaca}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
        <div>
          <p className="text-sm font-medium text-foreground">Live trading</p>
          <p className="text-[11px] text-muted-foreground">
            {live ? "Real orders will be sent on the next scan." : "Off — every order stays simulated."}
          </p>
        </div>
        <Switch checked={live} onCheckedChange={toggleLive} aria-label="Live trading" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Label htmlFor="alpaca_paper" className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Alpaca paper account
        </Label>
        <Switch id="alpaca_paper" checked={alpacaPaper} onCheckedChange={setAlpacaPaper} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="max_order_usd" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Max per order ($)
          </Label>
          <Input
            id="max_order_usd"
            type="number"
            inputMode="numeric"
            min="1"
            step="10"
            value={values.max_order_usd}
            onChange={(e) => setValues((v) => ({ ...v, max_order_usd: e.target.value }))}
            className="mt-1 h-9 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="min_cash_reserve_pct" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Cash reserve (%)
          </Label>
          <Input
            id="min_cash_reserve_pct"
            type="number"
            inputMode="numeric"
            min="0"
            max="90"
            step="5"
            value={values.min_cash_reserve_pct}
            onChange={(e) => setValues((v) => ({ ...v, min_cash_reserve_pct: e.target.value }))}
            className="mt-1 h-9 bg-background"
          />
        </div>
      </div>

      <Button size="sm" className="mt-3 w-full" onClick={save} disabled={saving || !config}>
        {saving ? "Saving…" : "Save broker settings"}
      </Button>
      <button
        type="button"
        onClick={refreshStatus}
        className="mt-2 w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Refresh balances
      </button>
    </div>
  );
}