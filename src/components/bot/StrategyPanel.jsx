import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS = [
  { key: "max_position_pct", label: "Max position %", step: "1", min: "1", max: "50" },
  { key: "max_positions", label: "Max positions", step: "1", min: "1", max: "30" },
  { key: "min_entry_score", label: "Min entry score", step: "1", min: "40", max: "95" },
  { key: "stop_loss_pct", label: "Stop loss %", step: "1", min: "2", max: "40" },
  { key: "take_profit_pct", label: "Take profit %", step: "1", min: "5", max: "200" },
];

export default function StrategyPanel({ config, onSaved }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    const next = {};
    FIELDS.forEach((f) => {
      next[f.key] = String(config[f.key] ?? "");
    });
    setValues(next);
  }, [config]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach((f) => {
        const n = Number(values[f.key]);
        if (Number.isFinite(n)) payload[f.key] = n;
      });
      await base44.entities.BotConfig.update(config.id, payload);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key} className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {f.label}
            </Label>
            <Input
              id={f.key}
              type="number"
              inputMode="numeric"
              step={f.step}
              min={f.min}
              max={f.max}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="mt-1 h-9 bg-background"
            />
          </div>
        ))}
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={save} disabled={saving || !config}>
        {saving ? "Saving…" : "Save strategy"}
      </Button>
    </div>
  );
}