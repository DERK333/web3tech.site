// The full tradable universe, read from the two broker platforms themselves
// rather than a hand-written list:
//   Kraken — every online USD spot pair
//   Alpaca — every active, tradable US stock and ETF
//
// The bot walks this list in slices (see runMarketBot), so nothing on either
// platform is permanently outside the sweep.

import { alpacaAssets } from './brokers.ts';

const KRAKEN_API = 'https://api.kraken.com';
const TIMEOUT_MS = 15000;

// Kraken reports legacy asset codes (XXBT, ZUSD…) — fold them back to tickers.
const NAME_MAP = { XBT: 'BTC', XDG: 'DOGE' };

// Stablecoins and fiat never produce a trend worth trading.
const STABLE = new Set([
  'USDT', 'USDC', 'DAI', 'TUSD', 'PYUSD', 'USDE', 'USDD', 'FDUSD', 'RLUSD',
  'EURC', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF',
]);

const normalise = (raw) => {
  let name = String(raw || '').toUpperCase().trim();
  if (name.length === 4 && /^[XZ]/.test(name)) name = name.slice(1);
  return NAME_MAP[name] || name;
};

async function krakenUsdPairs() {
  const res = await fetch(`${KRAKEN_API}/0/public/AssetPairs`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const json = await res.json();
  if (json?.error?.length) throw new Error(json.error.join(', '));

  const seen = new Map();
  for (const info of Object.values(json?.result || {}) as any[]) {
    const [base, quote] = String(info?.wsname || '').split('/');
    if (!base || quote?.toUpperCase() !== 'USD') continue;
    if (info?.status && info.status !== 'online') continue;
    const symbol = normalise(base);
    if (!/^[A-Z0-9]{2,10}$/.test(symbol) || STABLE.has(symbol)) continue;
    if (!seen.has(symbol)) seen.set(symbol, { symbol, asset_class: 'crypto' });
  }
  return [...seen.values()];
}

async function alpacaUniverse(keys, paper) {
  const assets = await alpacaAssets(keys, paper);
  const seen = new Map();
  for (const asset of assets) {
    const symbol = String(asset?.symbol || '').toUpperCase();
    // Plain common-stock and ETF tickers only — Alpaca also lists warrants and
    // preferred lines whose symbols carry suffixes the candle sources reject.
    if (!/^[A-Z]{1,5}$/.test(symbol)) continue;
    if (asset?.exchange && /OTC/i.test(String(asset.exchange))) continue;
    if (!seen.has(symbol)) seen.set(symbol, { symbol, asset_class: 'stock' });
  }
  return [...seen.values()];
}

export async function fetchPlatformUniverse(alpacaKeys, alpacaPaper = true) {
  const notes: string[] = [];

  const crypto = await krakenUsdPairs().catch((error) => {
    notes.push(`Kraken asset list unavailable: ${error.message}`);
    return [];
  });

  const stocks = alpacaKeys
    ? await alpacaUniverse(alpacaKeys, alpacaPaper).catch((error) => {
        notes.push(`Alpaca asset list unavailable: ${error.message}`);
        return [];
      })
    : (notes.push('No Alpaca key connected — stock coverage limited to the core list'), []);

  // Crypto first: it trades around the clock, so the rotating slice starts with
  // it and works through stocks afterwards.
  const sortSymbol = (a, b) => a.symbol.localeCompare(b.symbol);
  const assets = [...crypto.sort(sortSymbol), ...stocks.sort(sortSymbol)];

  return {
    assets,
    cryptoCount: crypto.length,
    stockCount: stocks.length,
    notes,
  };
}