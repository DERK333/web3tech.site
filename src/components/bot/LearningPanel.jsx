import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fmtPct, pnlClass } from "@/lib/botFormat";

const Stat = ({ label, value, valueClass = "text-foreground" }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-0.5 font-heading text-base font-bold ${valueClass}`}>{value}</p>
  </div>
);

export default function LearningPanel({ config, trades, onSaved }) {
  const [saving, setSaving] = useState(false);
  if (!config) return null;

  const autoTune = config.auto_tune !== false;
  const base = Number(config.min_entry_score ?? 66);
  const applied = autoTune ? Number(config.learned_entry_score ?? base) : base;

  const closed = trades.filter((t) => t.side === "sell" && t.realized_pct != null);
  const avgClosed =
    closed.length > 0
      ? closed.reduce((sum, t) => sum + Number(t.realized_pct), 0) / closed.length
      : null;

  const toggleAutoTune = async (next) => {
    setSaving(true);
    try {
      await base44.entities.BotConfig.update(config.id, { auto_tune: next });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Win rate"
          value={config.win_rate != null ? `${Math.round(Number(config.win_rate))}%` : "—"}
          valueClass={config.win_rate >= 50 ? "text-emerald-400" : "text-foreground"}
        />
        <Stat label="Closed" value={String(config.closed_trades ?? 0)} />
        <Stat label="Entry bar" value={String(applied)} />
      </div>

      {avgClosed != null ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Average result on the last {closed.length} closed trade{closed.length === 1 ? "" : "s"}:{" "}
          <span className={pnlClass(avgClosed)}>{fmtPct(avgClosed)}</span>
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {config.learning_note ||
          `The bot is still collecting results. After 8 closed trades it starts moving its ${base} entry bar: up after a losing streak, down after sustained wins.`}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <Label htmlFor="auto_tune" className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Self-tuning
        </Label>
        <Switch id="auto_tune" checked={autoTune} disabled={saving} onCheckedChange={toggleAutoTune} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
        Tuning changes how selective the bot is. It raises the bar when its own results are poor —
        it cannot make a trade profitable or remove risk.
      </p>
    </div>
  );
}