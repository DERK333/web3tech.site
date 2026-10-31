import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The bot's perp ideas, for manual placement in Atomic Wallet.
//
// Atomic's perps run on Hyperliquid and expose no API a bot can call, so this
// function deliberately stops at the suggestion: it returns entry, stop, target
// and a leverage hint and never touches an exchange or a key. Levels come from
// the same realized volatility the spot bot measured, so a stop sits outside
// ordinary noise instead of inside it. Longs come from momentum that is still
// working; shorts from names whose trend has rolled over.

const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const decimalsFor = (price) => (price >= 1000 ? 2 : price >= 1 ? 3 : 6);

// Only coins with a deep perp market on Hyperliquid (what Atomic's perps run
// on). Shorting a micro-cap that fell 60% has no market to fill it and is not a
// setup anyone can actually place.
const PERP_MAJORS = new Set([
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'LTC', 'BCH',
  'DOT', 'ATOM', 'NEAR', 'APT', 'SUI', 'ARB', 'OP', 'TON', 'TRX', 'XLM', 'HYPE',
]);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const signals = (await base44.entities.BotSignal.list('-scanned_at', 500)) || [];
    const crypto = signals.filter(
      (s) =>
        s.asset_class === 'crypto' &&
        PERP_MAJORS.has(String(s.symbol || '').toUpperCase()) &&
        Number(s.price) > 0 &&
        Math.abs(Number(s.volatility_pct) || 0) <= 150
    );

    if (crypto.length === 0) {
      return Response.json({
        setups: [],
        message: 'No major-coin signals yet — run a market scan first.',
      });
    }

    const toIdea = (signal, side) => ({
      signal,
      side,
      conviction: side === 'long' ? Number(signal.score) : 100 - Number(signal.score),
    });

    const longs = crypto
      .filter(
        (s) =>
          (s.action === 'strong_buy' || s.action === 'buy') &&
          Number(s.score) >= 58 &&
          Number(s.momentum_20d_pct ?? 0) > 0
      )
      .map((s) => toIdea(s, 'long'))
      .sort((a, b) => b.conviction - a.conviction)
      .slice(0, 4);

    // A good short is an early rollover, not a coin already in free fall with an
    // RSI in the teens — that trade is chasing and gets stopped on the bounce.
    const shorts = crypto
      .filter((s) => {
        const momentum = Number(s.momentum_20d_pct ?? 0);
        const rsi = Number(s.rsi14 ?? 50);
        return (
          Number(s.score) <= 55 && momentum < -3 && momentum > -30 && rsi >= 20 && rsi <= 55
        );
      })
      .map((s) => toIdea(s, 'short'))
      .sort((a, b) => b.conviction - a.conviction)
      .slice(0, 4);

    const ranked = [...longs, ...shorts]
      .sort((a, b) => b.conviction - a.conviction)
      .slice(0, 6);

    if (ranked.length === 0) {
      return Response.json({
        setups: [],
        message: 'Nothing clears the bar right now — no setup worth forcing.',
      });
    }

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

    return Response.json({
      setups,
      scanned_signals: crypto.length,
      note: 'Suggestions only — place them yourself in Atomic. Nothing here sends an order.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}