// Perp setup rules, shared by the perp panel and the scan's alerts so a card and
// an alert always describe the same trade.
//
// Atomic's perps run on Hyperliquid and expose no API a bot can call, so this
// stops at the suggestion: entry, stop, target and a leverage hint, never an
// order and never a key.

export const PERP_MAJORS = new Set([
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'LTC', 'BCH',
  'DOT', 'ATOM', 'NEAR', 'APT', 'SUI', 'ARB', 'OP', 'TON', 'TRX', 'XLM', 'HYPE',
]);

const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const decimalsFor = (price) => (price >= 1000 ? 2 : price >= 1 ? 3 : 6);

export function buildPerpSetups({ signals, maxResults = 6, perSide = 4 }) {
  const eligible = (signals || []).filter(
    (s) =>
      s.asset_class === 'crypto' &&
      PERP_MAJORS.has(String(s.symbol || '').toUpperCase()) &&
      Number(s.price) > 0 &&
      Math.abs(Number(s.volatility_pct) || 0) <= 150
  );

  if (eligible.length === 0) return { setups: [], eligible: 0 };

  const toIdea = (signal, side) => ({
    signal,
    side,
    conviction: side === 'long' ? Number(signal.score) : 100 - Number(signal.score),
  });

  const longs = eligible
    .filter(
      (s) =>
        (s.action === 'strong_buy' || s.action === 'buy') &&
        Number(s.score) >= 58 &&
        Number(s.momentum_20d_pct ?? 0) > 0
    )
    .map((s) => toIdea(s, 'long'))
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, perSide);

  // A good short is an early rollover, not a coin already in free fall with an
  // RSI in the teens — that trade is chasing and gets stopped on the bounce.
  const shorts = eligible
    .filter((s) => {
      const momentum = Number(s.momentum_20d_pct ?? 0);
      const rsi = Number(s.rsi14 ?? 50);
      return (
        Number(s.score) <= 55 && momentum < -3 && momentum > -30 && rsi >= 20 && rsi <= 55
      );
    })
    .map((s) => toIdea(s, 'short'))
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, perSide);

  const ranked = [...longs, ...shorts]
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, maxResults);

  const setups = ranked.map(({ signal, side, conviction }) => {
    const price = Number(signal.price);
    const volatility = Math.abs(Number(signal.volatility_pct) || 0);
    const riskPct = round(clamp(Number(signal.risk_pct) || volatility / 3 || 4, 2.5, 14), 2);
    const rewardRatio = round(clamp(Number(signal.reward_risk) || 2, 1.3, 3.5), 2);
    const targetPct = round(clamp(riskPct * rewardRatio, 4, 55), 2);
    const digits = decimalsFor(price);

    // Leverage is capped so a full stop costs at most ~18% of the margin
    // posted, rather than taking the whole position out.
    const baseLeverage = volatility >= 90 ? 1 : volatility >= 60 ? 2 : 3;
    const leverage = clamp(Math.min(baseLeverage, Math.floor((18 / riskPct) * 2) / 2), 1, baseLeverage);

    const stop = round(
      side === 'long' ? price * (1 - riskPct / 100) : price * (1 + riskPct / 100),
      digits
    );
    const target = round(
      side === 'long' ? price * (1 + targetPct / 100) : price * (1 - targetPct / 100),
      digits
    );

    const momentum = Number(signal.momentum_20d_pct ?? 0);
    const thesis =
      side === 'long'
        ? `${momentum >= 0 ? '+' : ''}${momentum.toFixed(1)}% over 20 sessions with the trend intact; the stop sits ${riskPct}% away because this pair routinely swings that far.`
        : `${momentum.toFixed(1)}% over 20 sessions with momentum broken; the short works while bounces stay under the stop ${riskPct}% above.`;

    return {
      symbol: signal.symbol,
      side,
      conviction: Math.round(conviction),
      score: signal.score,
      action: signal.action,
      entry: round(price, digits),
      stop,
      target,
      stop_pct: riskPct,
      target_pct: targetPct,
      reward_ratio: rewardRatio,
      leverage,
      margin_stop_pct: round(riskPct * leverage, 1),
      volatility_pct: volatility ? round(volatility, 1) : null,
      momentum_20d_pct: round(momentum, 2),
      rationale: signal.rationale || thesis,
      thesis,
      scanned_at: signal.scanned_at || null,
    };
  });

  return { setups, eligible: eligible.length };
}

// Turn the setups clear of the user's conviction bar into alerts. A setup that
// stays on the board for days should not re-alert on every scan, so each
// symbol and direction is limited to one alert per cooldown window.
export function buildPerpAlerts({ setups, recent, minConviction = 80, cooldownHours = 12 }) {
  const bar = Number(minConviction) > 0 ? Number(minConviction) : 80;
  const cutoff = Date.now() - cooldownHours * 60 * 60 * 1000;
  const recentKeys = new Set(
    (recent || [])
      .filter(
        (a) =>
          a?.kind === 'perp_setup' &&
          a?.triggered_at &&
          new Date(a.triggered_at).getTime() >= cutoff
      )
      .map((a) => `${String(a.symbol).toUpperCase()}:${a.side || 'long'}`)
  );

  const triggeredAt = new Date().toISOString();
  const alerts = [];

  for (const setup of setups || []) {
    if (Number(setup.conviction) < bar) continue;
    const key = `${String(setup.symbol).toUpperCase()}:${setup.side}`;
    if (recentKeys.has(key)) continue;
    recentKeys.add(key);

    alerts.push({
      symbol: setup.symbol,
      asset_class: 'crypto',
      side: setup.side,
      kind: 'perp_setup',
      severity: setup.conviction >= Math.min(95, bar + 10) ? 'critical' : 'warning',
      title: `High-probability ${setup.side === 'long' ? 'LONG' : 'SHORT'} on ${setup.symbol}`,
      text: undefined,
      message:
        `Entry ${setup.entry} · stop ${setup.stop} · target ${setup.target} · ` +
        `${setup.leverage}x suggested (a full stop costs ~${setup.margin_stop_pct}% of margin). ${setup.thesis}`,
      value: setup.conviction,
      threshold: bar,
      triggered_at: triggeredAt,
      seen: false,
    });
  }

  return alerts;
}