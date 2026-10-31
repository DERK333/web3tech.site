import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const CLASSES = ["stock", "etf", "crypto"];

export default function WatchlistManager({ assets, onChanged }) {
  const [symbol, setSymbol] = useState("");
  const [assetClass, setAssetClass] = useState("stock");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addAsset = async (e) => {
    e.preventDefault();
    const ticker = symbol.trim().toUpperCase();
    if (!ticker) return;
    if (assets.some((a) => a.symbol.toUpperCase() === ticker)) {
      setError(`${ticker} is already on the watchlist.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await base44.entities.BotAsset.create({ symbol: ticker, asset_class: assetClass, enabled: true });
      setSymbol("");
      await onChanged();
    } catch (err) {
      setError(err.message || "Could not add that asset.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (asset) => {
    setBusy(true);
    try {
      await base44.entities.BotAsset.update(asset.id, { enabled: !asset.enabled });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (asset) => {
    setBusy(true);
    try {
      await base44.entities.BotAsset.delete(asset.id);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <form onSubmit={addAsset} className="flex gap-2">
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Ticker"
          aria-label="Ticker symbol"
          className="h-9 flex-1 bg-background"
          maxLength={12}
        />
        <select
          value={assetClass}
          onChange={(e) => setAssetClass(e.target.value)}
          aria-label="Asset class"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        >
          {CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" className="h-9" disabled={busy || !symbol.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

      <div className="mt-3 divide-y divide-border/60">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center gap-2 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{asset.symbol}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{asset.asset_class}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Switch
                checked={asset.enabled !== false}
                onCheckedChange={() => toggle(asset)}
                disabled={busy}
                aria-label={`Scan ${asset.symbol}`}
              />
              <button
                type="button"
                onClick={() => remove(asset)}
                disabled={busy}
                aria-label={`Remove ${asset.symbol}`}
                className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <p className="py-3 text-xs text-muted-foreground">Watchlist is empty. Add a ticker above.</p>
        )}
      </div>
    </div>
  );
}