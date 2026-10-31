import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { fetchSeries } from '../../shared/marketData.ts';

// Side-by-side trend tracking: how the crypto the bot tracks has moved next to
// the stocks and ETFs it tracks, over the same calendar window.
//
// Every asset's closes are indexed to 0% at the start of the window, then all
// members of a class are averaged into one equal-weight line, so the two lines
// answer one question: which side of the book is working right now.
//
// Public daily data only — no broker keys, no orders, no stored state.

const RANGES = [30, 90, 180];
const POINTS = 40;
const MAX_PER_CLASS = 4;
const CACHE_TTL_MS = 10 * 60 * 1000;

// Liquid benchmarks that make the two sides comparable. A watchlist asset is
// preferred over a benchmark, but the basket always fills up from here — the
// wide scan also surfaces micro-caps whose pumps distort an equal-weight average.
const BENCHMARKS = {
  crypto: ['BTC', 'ETH', 'SOL', 'XRP'],
  stock: ['SPY', 'QQQ', 'NVDA', 'AAPL'],
};
const MIN_PER_CLASS = 3;

const cache = new Map();

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Evenly spaced calendar labels across the window, so both classes share one x axis.
function buildLabels(days) {
  const end = Date.now();
  const labels = [];
  for (let i = 0; i < POINTS; i++) {
    const at = end - days * 86400000 * (1 - i / (POINTS - 1));
    labels.push(new Date(at).toISOString().slice(0, 10));
  }
  return labels;
}

// Stretch a percentage series onto the shared POINTS grid (linear interpolation),
// because crypto trades every day and stocks trade about five days a week.
function resample(series, points = POINTS) {
  if (!series.length) return null;
  if (series.length === 1) return Array.from({ length: points }, () => series[0]);
  const out = [];
  for (let i = 0; i < points; i++) {
    const pos = (i / (points - 1)) * (series.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    const weight = pos - lo;
    out.push(series[lo] * (1 - weight) + series[hi] * weight);
  }
  return out;
}

function percentSeries(closes, sessions) {
  const slice = closes.slice(-(sessions + 1));
  if (slice.length < 5) return null;
  const base = slice[0];
  if (!(base > 0)) return null;
  return slice.map((value) => ((value - base) / base) * 100);
}

function averageLines(lines) {
  if (!lines.length) return null;
  const out = Array.from({ length: POINTS }, () => 0);
  for (const line of lines) {
    for (let i = 0; i < POINTS; i++) out[i] += line[i];
  }
  return out.map((value) => round2(value / lines.length));
}

// The user's own watchlist leads the basket; liquid benchmarks fill the rest so
// the two lines always compare like with like.
async function pickMembers(base44, userId) {
  const picked = { crypto: [], stock: [] };

  try {
    const assets = await base44.entities.BotAsset.filter({ owner_id: userId, enabled: true });
    for (const asset of assets || []) {
      const group = asset?.asset_class === 'crypto' ? 'crypto' : 'stock';
      const symbol = String(asset?.symbol || '').toUpperCase();
      if (!symbol || picked[group].includes(symbol)) continue;
      if (picked[group].length < MAX_PER_CLASS) picked[group].push(symbol);
    }
  } catch {
    // No watchlist read should not break the view — benchmarks alone are fine.
  }

  for (const group of ['crypto', 'stock']) {
    for (const symbol of BENCHMARKS[group]) {
      if (picked[group].length >= MAX_PER_CLASS) break;
      if (!picked[group].includes(symbol)) picked[group].push(symbol);
    }
  }

  return picked;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requested = Number(body?.days);
    const days = RANGES.includes(requested) ? requested : 90;

    const cached = cache.get(days);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return Response.json(cached.payload);
    }

    const members = await pickMembers(base44, user.id);
    const targets = [
      ...members.crypto.map((symbol) => ({ symbol, asset_class: 'crypto' })),
      ...members.stock.map((symbol) => ({ symbol, asset_class: 'stock' })),
    ];

    // Crypto trades every day; stocks about five days in seven.
    const sessionsFor = (assetClass) =>
      assetClass === 'crypto' ? days : Math.max(25, Math.round((days * 5) / 7));

    const lines = { crypto: [], stock: [] };
    const included = { crypto: [], stock: [] };
    const unavailable = [];

    for (let i = 0; i < targets.length; i += 4) {
      const batch = targets.slice(i, i + 4);
      const settled = await Promise.allSettled(batch.map((t) => fetchSeries(t.symbol, t.asset_class)));

      settled.forEach((result, index) => {
        const target = batch[index];
        if (result.status !== 'fulfilled') {
          unavailable.push(target.symbol);
          return;
        }
        const series = percentSeries(result.value.closes || [], sessionsFor(target.asset_class));
        const resampled = series ? resample(series) : null;
        if (!resampled) {
          unavailable.push(target.symbol);
          return;
        }
        const group = target.asset_class === 'crypto' ? 'crypto' : 'stock';
        lines[group].push(resampled);
        included[group].push({
          symbol: target.symbol,
          asset_class: target.asset_class,
          return_pct: round2(resampled[resampled.length - 1]),
        });
      });
    }

    const cryptoLine = averageLines(lines.crypto);
    const stockLine = averageLines(lines.stock);

    if (!cryptoLine && !stockLine) {
      return Response.json(
        { error: 'No market data came back for these assets. Try again in a minute.' },
        { status: 502 }
      );
    }

    const payload = {
      days,
      labels: buildLabels(days),
      crypto: cryptoLine,
      stocks: stockLine,
      crypto_members: included.crypto.sort((a, b) => b.return_pct - a.return_pct),
      stock_members: included.stock.sort((a, b) => b.return_pct - a.return_pct),
      crypto_return_pct: cryptoLine ? cryptoLine[cryptoLine.length - 1] : null,
      stock_return_pct: stockLine ? stockLine[stockLine.length - 1] : null,
      unavailable,
      generated_at: new Date().toISOString(),
    };

    cache.set(days, { at: Date.now(), payload });
    return Response.json(payload);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}