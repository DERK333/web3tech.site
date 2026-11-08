export const fmtMoney = (value, digits = 2) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const fmtQty = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 4 }) : n.toPrecision(4);
};

export const fmtPct = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

export const pnlClass = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "text-muted-foreground";
  return n > 0 ? "text-emerald-400" : "text-red-400";
};

export const ACTION_META = {
  strong_buy: {
    label: "Strong buy",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  buy: { label: "Buy", className: "bg-green-500/10 text-green-400 border-green-500/25" },
  hold: { label: "Hold", className: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
  trim: { label: "Trim", className: "bg-orange-500/10 text-orange-400 border-orange-500/25" },
  avoid: { label: "Avoid", className: "bg-red-500/10 text-red-400 border-red-500/25" },
};

export const actionMeta = (action) => ACTION_META[action] || ACTION_META.hold;

export const scoreClass = (score) => {
  const n = Number(score);
  if (n >= 72) return "bg-emerald-400";
  if (n >= 62) return "bg-green-400";
  if (n >= 45) return "bg-amber-400";
  if (n >= 34) return "bg-orange-400";
  return "bg-red-400";
};