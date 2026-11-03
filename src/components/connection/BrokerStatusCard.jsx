import React from "react";
import { AlertTriangle, CheckCircle2, Timer } from "lucide-react";
import { fmtMoney } from "@/lib/botFormat";

function pill(data, title) {
  if (!data?.configured) {
    return {
      tone: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      icon: AlertTriangle,
      label: "Not linked",
    };
  }
  if (data.ok) {
    return {
      tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      icon: CheckCircle2,
      label: "Linked · responding",
    };
  }
  return {
    tone: "border-red-500/30 bg-red-500/10 text-red-400",
    icon: AlertTriangle,
    label: "Key saved · check failed",
  };
}

export default function BrokerStatusCard({ title, kind, data }) {
  const state = pill(data, title);
  const Icon = state.icon;
  const isKraken = kind === "kraken";
  const value = isKraken
    ? data?.ok
      ? Number(data.total ?? data.cash)
      : null
    : data?.ok
      ? Number(data.equity ?? data.cash)
      : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${state.tone}`}
        >
          <Icon className="h-3 w-3" />
          {state.label}
        </span>
      </div>

      <p className="mt-2 font-heading text-xl font-bold text-foreground">
        {value == null ? "—" : fmtMoney(value)}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {data?.own_key
          ? `Your key${data.hint ? ` ending ${data.hint}` : ""}`
          : data?.app_key
            ? "Using the app owner's key"
            : "No key saved yet"}
        {isKraken && data?.ok
          ? ` · ${fmtMoney(data.cash)} cash · ${fmtMoney(data.crypto_value)} crypto`
          : ""}
        {!isKraken && data?.ok
          ? ` · ${fmtMoney(data.cash)} cash · ${data.paper === false ? "live account" : "paper account"}`
          : ""}
      </p>

      {data?.error ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-red-400">
          <Timer className="mt-0.5 h-3 w-3 shrink-0" />
          {data.error}
        </p>
      ) : null}
    </div>
  );
}