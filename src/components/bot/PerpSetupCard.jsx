import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Copy } from "lucide-react";

const fmt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const digits = n >= 1000 ? 2 : n >= 1 ? 3 : 6;
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export default function PerpSetupCard({ setup }) {
  const [copied, setCopied] = useState(false);
  const long = setup.side === "long";
  const Icon = long ? ArrowUpRight : ArrowDownRight;

  const copy = async () => {
    const line = `${setup.symbol} ${long ? "LONG" : "SHORT"} — entry ${fmt(setup.entry)}, stop ${fmt(setup.stop)}, target ${fmt(setup.target)}, ${setup.leverage}x`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        long ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-red-500/25 bg-red-500/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              long ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            <Icon className="w-3 h-3" />
            {long ? "Long" : "Short"}
          </span>
          <span className="font-heading text-sm font-bold text-foreground">{setup.symbol}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">conviction {setup.conviction}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="text-muted-foreground">Entry</p>
          <p className="mt-0.5 font-mono text-foreground">{fmt(setup.entry)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Stop</p>
          <p className="mt-0.5 font-mono text-red-400">{fmt(setup.stop)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Target</p>
          <p className="mt-0.5 font-mono text-emerald-400">{fmt(setup.target)}</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {setup.reward_ratio}:1 reward · {setup.leverage}x suggested · a full stop costs ~
        {setup.margin_stop_pct}% of margin
      </p>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{setup.rationale}</p>

      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy levels"}
      </button>
    </div>
  );
}