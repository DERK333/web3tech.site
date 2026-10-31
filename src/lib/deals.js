// Pairs the bot's individual fills into deals: each buy is an entry, and the
// sell that closes it supplies the final outcome. Trades arrive newest first
// from the database, so they are replayed oldest first before pairing.
const timeOf = (trade) => new Date(trade.executed_at || trade.created_date || 0).getTime();

export function buildDeals(trades) {
  const ordered = [...trades].sort((a, b) => timeOf(a) - timeOf(b));
  const lots = new Map();
  const deals = [];

  for (const trade of ordered) {
    const symbol = (trade.symbol || "").toUpperCase();
    const quantity = Number(trade.quantity) || 0;
    const price = Number(trade.price) || 0;
    const at = trade.executed_at || trade.created_date;

    if (trade.side === "buy") {
      const deal = {
        id: trade.id,
        symbol,
        asset_class: trade.asset_class,
        venue: trade.venue || "paper",
        mode: trade.mode || "paper",
        entry_price: price,
        entry_at: at,
        quantity,
        entry_notional: Number(trade.notional) || quantity * price,
        score: trade.score,
        entry_reason: trade.reason,
        exit_price: null,
        exit_at: null,
        exit_reason: null,
        realized: null,
        realized_pct: null,
        status: "open",
      };
      deals.push(deal);
      if (!lots.has(symbol)) lots.set(symbol, []);
      lots.get(symbol).push({ deal, remaining: quantity });
      continue;
    }

    const queue = lots.get(symbol) || [];
    const lot = queue.find((entry) => entry.remaining > 0);

    // A sell whose entry happened before the loaded window still belongs in the log.
    if (!lot) {
      deals.push({
        id: trade.id,
        symbol,
        asset_class: trade.asset_class,
        venue: trade.venue || "paper",
        mode: trade.mode || "paper",
        entry_price: null,
        entry_at: null,
        quantity,
        entry_notional: null,
        score: trade.score,
        entry_reason: null,
        exit_price: price,
        exit_at: at,
        exit_reason: trade.reason,
        realized: Number.isFinite(Number(trade.realized_pnl)) ? Number(trade.realized_pnl) : null,
        realized_pct: Number.isFinite(Number(trade.realized_pct)) ? Number(trade.realized_pct) : null,
        status: "closed",
      });
      continue;
    }

    const matched = Math.min(quantity, lot.remaining);
    lot.remaining -= matched;
    const deal = lot.deal;

    deal.exit_price = price;
    deal.exit_at = at;
    deal.exit_reason = trade.reason;

    const booked = Number(trade.realized_pnl);
    if (Number.isFinite(booked)) deal.realized = (Number(deal.realized) || 0) + booked;

    const bookedPct = Number(trade.realized_pct);
    deal.realized_pct = Number.isFinite(bookedPct)
      ? bookedPct
      : deal.entry_price > 0
        ? ((price - deal.entry_price) / deal.entry_price) * 100
        : null;

    deal.status = lot.remaining > 0 ? "partial" : "closed";
  }

  return deals.sort(
    (a, b) =>
      new Date(b.exit_at || b.entry_at || 0).getTime() -
      new Date(a.exit_at || a.entry_at || 0).getTime()
  );
}

export const dealCloseTime = (deal) => new Date(deal.exit_at || deal.entry_at || 0).getTime();

export const fmtDealDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};