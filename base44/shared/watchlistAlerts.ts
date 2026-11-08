// Watchlist alert rules.
//
// Called once per scan with the signals just written and the signals they
// replaced, so an alert means "something changed since last time" rather than
// "this condition is still true". A permanently wild coin would otherwise alert
// on every single scan.

export const ALERT_DEFAULTS = { move_pct: 8, vol_pct: 60 };

// One alert per symbol and rule every few hours.
const COOLDOWN_MS = 6 * 60 * 60 * 1000;

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export function evaluateAlerts({ previous, current, symbols, settings, recent }) {
  const movePct =
    Number(settings?.move_pct) > 0 ? Number(settings.move_pct) : ALERT_DEFAULTS.move_pct;
  const volPct =
    Number(settings?.vol_pct) > 0 ? Number(settings.vol_pct) : ALERT_DEFAULTS.vol_pct;

  const cutoff = Date.now() - COOLDOWN_MS;
  const recentKeys = new Set(
    (recent || [])
      .filter((a) => a?.triggered_at && new Date(a.triggered_at).getTime() >= cutoff)
      .map((a) => `${a.symbol}:${a.kind}`)
  );

  const alerts = [];
  const push = (alert) => {
    const key = `${alert.symbol}:${alert.kind}`;
    if (recentKeys.has(key)) return;
    recentKeys.add(key);
    alerts.push({ ...alert, triggered_at: new Date().toISOString(), seen: false });
  };

  for (const signal of current || []) {
    const symbol = String(signal?.symbol || '').toUpperCase();
    if (!symbols.has(symbol)) continue;

    const price = Number(signal.price);
    const prev = previous?.get ? previous.get(symbol) : null;
    const prevPrice = Number(prev?.price);
    const assetClass = signal.asset_class;

    // 1. Sharp move since the previous scan.
    if (Number.isFinite(prevPrice) && prevPrice > 0 && Number.isFinite(price) && price > 0) {
      const changePct = ((price - prevPrice) / prevPrice) * 100;
      if (Math.abs(changePct) >= movePct) {
        const up = changePct > 0;
        push({
          symbol,
          asset_class: assetClass,
          kind: 'price_move',
          severity: Math.abs(changePct) >= movePct * 2 ? 'critical' : 'warning',
          title: `${symbol} ${up ? 'jumped' : 'dropped'} ${Math.abs(round(changePct, 1))}%`,
          message: `Moved from ${prevPrice} to ${price} since the last scan, past your ${movePct}% threshold.`,
          value: round(changePct),
          threshold: movePct,
          previous_value: prevPrice,
        });
      }
    }

    // 2. Crossing the 50-day average — a trend milestone, not noise.
    const gap = Number(signal.sma50_gap_pct);
    const prevGap = Number(prev?.sma50_gap_pct);
    if (
      Number.isFinite(gap) &&
      Number.isFinite(prevGap) &&
      prevGap !== 0 &&
      Math.sign(gap) !== Math.sign(prevGap)
    ) {
      const above = gap > 0;
      push({
        symbol,
        asset_class: assetClass,
        kind: 'sma_cross',
        severity: 'warning',
        title: `${symbol} crossed ${above ? 'above' : 'below'} its 50-day average`,
        message: `The 50-day gap flipped from ${round(prevGap, 1)}% to ${round(gap, 1)}% — the trend has turned.`,
        value: round(gap),
        threshold: 0,
        previous_value: round(prevGap),
      });
    }

    // 3. Volatility spiking above the threshold.
    const volatility = Number(signal.volatility_pct);
    const prevVol = Number(prev?.volatility_pct);
    if (Number.isFinite(volatility) && volatility >= volPct && !(prevVol >= volPct)) {
      push({
        symbol,
        asset_class: assetClass,
        kind: 'volatility',
        severity: volatility >= volPct * 1.5 ? 'critical' : 'warning',
        title: `${symbol} volatility hit ${round(volatility, 0)}%`,
        message: `Annualized 20-day volatility is ${round(volatility, 0)}%, above your ${volPct}% threshold — position size matters more here.`,
        value: round(volatility, 1),
        threshold: volPct,
        previous_value: Number.isFinite(prevVol) ? round(prevVol, 1) : null,
      });
    }

    // 4. RSI reaching an extreme it was not at before.
    const rsi = Number(signal.rsi14);
    const prevRsi = Number(prev?.rsi14);
    if (Number.isFinite(rsi) && Number.isFinite(prevRsi)) {
      if (rsi >= 70 && prevRsi < 70) {
        push({
          symbol,
          asset_class: assetClass,
          kind: 'rsi_extreme',
          severity: 'info',
          title: `${symbol} is overbought (RSI ${round(rsi, 0)})`,
          message: `RSI(14) moved from ${round(prevRsi, 0)} to ${round(rsi, 0)} — extended, and pullback risk is higher.`,
          value: round(rsi, 1),
          threshold: 70,
          previous_value: round(prevRsi, 1),
        });
      } else if (rsi <= 30 && prevRsi > 30) {
        push({
          symbol,
          asset_class: assetClass,
          kind: 'rsi_extreme',
          severity: 'info',
          title: `${symbol} is oversold (RSI ${round(rsi, 0)})`,
          message: `RSI(14) moved from ${round(prevRsi, 0)} to ${round(rsi, 0)} — sold off hard, and a bounce is possible.`,
          value: round(rsi, 1),
          threshold: 30,
          previous_value: round(prevRsi, 1),
        });
      }
    }
  }

  return alerts;
}