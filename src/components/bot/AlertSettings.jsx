import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AlertSettings({ config, onSaved }) {
  const [movePct, setMovePct] = useState("8");
  const [volPct, setVolPct] = useState("60");
  const [perpScore, setPerpScore] = useState("80");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    setMovePct(String(config.alert_move_pct ?? 8));
    setVolPct(String(config.alert_vol_pct ?? 60));
    setPerpScore(String(config.perp_alert_score ?? 80));
    setEnabled(config.alerts_enabled !== false);
  }, [config]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const payload = { alerts_enabled: enabled };
      const move = Number(movePct);
      const vol = Number(volPct);
      if (Number.isFinite(move) && move > 0) payload.alert_move_pct = move;
      if (Number.isFinite(vol) && vol > 0) payload.alert_vol_pct = vol;
      const perp = Number(perpScore);
      if (Number.isFinite(perp) && perp > 0) payload.perp_alert_score = perp;
      await base44.entities.BotConfig.update(config.id, payload);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Watchlist alerts</p>
          <p className="text-[11px] text-muted-foreground">Checked on every market scan</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Watchlist alerts"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="alert_move_pct" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Move %
          </Label>
          <Input
            id="alert_move_pct"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            max="50"
            value={movePct}
            onChange={(e) => setMovePct(e.target.value)}
            className="mt-1 h-9 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="alert_vol_pct" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Volatility %
          </Label>
          <Input
            id="alert_vol_pct"
            type="number"
            inputMode="numeric"
            step="5"
            min="10"
            max="300"
            value={volPct}
            onChange={(e) => setVolPct(e.target.value)}
            className="mt-1 h-9 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="perp_alert_score" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Perp score
          </Label>
          <Input
            id="perp_alert_score"
            type="number"
            inputMode="numeric"
            step="1"
            min="40"
            max="99"
            value={perpScore}
            onChange={(e) => setPerpScore(e.target.value)}
            className="mt-1 h-9 bg-background"
          />
        </div>
      </div>

      <Button size="sm" className="mt-3 w-full" onClick={save} disabled={saving || !config}>
        {saving ? "Saving…" : "Save alert rules"}
      </Button>
    </div>
  );
}