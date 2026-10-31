import React from "react";
import { Wallet, PieChart, TrendingUp, Banknote } from "lucide-react";
import { fmtMoney, fmtPct, pnlClass } from "@/lib/botFormat";

function Card({ icon: Icon, label, value, hint, valueClass = "text-foreground" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className={`mt-2 font-heading text-xl font-bold ${valueClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function PortfolioSummary({ config, positions }) {
  const cash = Number(config?.cash_balance ?? 0) + Number(config?.live_cash ?? 0);
  const starting = Number(config?.starting_cash ?? 0);
  const invested = positions.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.last_price ?? p.avg_cost ?? 0),
    0
  );
  const equity = cash + invested;
  const pnl = starting > 0 ? equity - starting : 0;
  const pnlPct = starting > 0 ? (pnl / starting) * 100 : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        icon={TrendingUp}
        label="Portfolio value"
        value={fmtMoney(equity)}
        hint={`Started at ${fmtMoney(starting, 0)}`}
      />
      <Card
        icon={Banknote}
        label="Total P&L"
        value={fmtMoney(pnl)}
        hint={`${fmtPct(pnlPct)} since inception`}
        valueClass={pnlClass(pnl)}
      />
      <Card icon={Wallet} label="Cash" value={fmtMoney(cash)} hint="Available to deploy" />
      <Card
        icon={PieChart}
        label="Invested"
        value={fmtMoney(invested)}
        hint={`${positions.length} open position${positions.length === 1 ? "" : "s"}`}
      />
    </div>
  );
}