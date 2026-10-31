// Key-free public market data used by the market bot.
// Stocks / ETFs: NASDAQ public historical endpoint, with Yahoo chart as fallback.
// Crypto: Kraken public OHLC endpoint (USD pairs).
//
// All public and unauthenticated, so calls go through retry-with-backoff.
// Daily closes only — not real-time tick data.

const NASDAQ_URL = 'https://api.nasdaq.com/api/quote/';
const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const KRAKEN_URL = 'https://api.kraken.com/0/public/OHLC';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Kraken's pair naming: BTC is XBT, DOGE is XDG.
export function krakenPair(symbol: string): string {
  const s = String(symbol || '').toUpperCase().trim();
  if (s === 'BTC') return 'XBTUSD';
  if (s === 'DOGE') return 'XDGUSD';
  return `${s}USD`;
}

async function getJson(url: string, label: string, attempts = 3, headers: Record<string, string> = BROWSER_HEADERS) {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000), headers });
      if (res.status === 429 || res.status === 503) {
        lastError = new Error(`${label}: rate limited (HTTP ${res.status})`);
        await sleep(700 + attempt * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt < attempts - 1) await sleep(500 + attempt * 700);
    }
  }
  throw lastError || new Error(`${label}: request failed`);
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function parseNasdaqRows(rows: any[]) {
  const closes: number[] = [];
  const volumes: number[] = [];
  let asOf: string | null = null;

  // NASDAQ returns newest first — reverse to oldest first.
  for (const row of [...rows].reverse()) {
    const close = Number(String(row?.close ?? '').replace(/[$,]/g, ''));
    if (!Number.isFinite(close) || close <= 0) continue;
    const [mm, dd, yyyy] = String(row?.date || '').split('/');
    const iso = mm && dd && yyyy ? `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` : null;
    closes.push(close);
    volumes.push(Number(String(row?.volume ?? '').replace(/,/g, '')) || 0);
    if (iso) asOf = iso;
  }

  return { closes, volumes, asOf };
}

async function fetchNasdaq(symbol: string, assetClass: string) {
  const end = new Date();
  const start = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
  const assetClasses = assetClass === 'etf' ? ['etf', 'stocks'] : ['stocks', 'etf'];

  let lastError: Error | null = null;
  for (const ac of assetClasses) {
    const url =
      `${NASDAQ_URL}${encodeURIComponent(symbol.toUpperCase())}/historical` +
      `?assetclass=${ac}&fromdate=${isoDay(start)}&todate=${isoDay(end)}&limit=500`;
    try {
      const json = await getJson(url, `NASDAQ ${symbol}`);
      const rows = json?.data?.tradesTable?.rows;
      if (!Array.isArray(rows) || rows.length === 0) throw new Error(`NASDAQ ${symbol}: no rows`);
      const parsed = parseNasdaqRows(rows);
      if (parsed.closes.length < 60) throw new Error(`NASDAQ ${symbol}: only ${parsed.closes.length} closes`);
      return { symbol, closes: parsed.closes, volumes: parsed.volumes, latestPrice: parsed.closes[parsed.closes.length - 1], asOf: parsed.asOf };
    } catch (error) {
      lastError = error as Error;
    }
  }
  throw lastError || new Error(`NASDAQ ${symbol}: request failed`);
}

async function fetchYahoo(symbol: string) {
  const url = `${YAHOO_URL}${encodeURIComponent(symbol.toUpperCase())}?range=2y&interval=1d`;
  const json = await getJson(url, `Yahoo ${symbol}`);
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};
  const rawCloses: (number | null)[] = quote.close || [];
  const rawVolumes: (number | null)[] = quote.volume || [];

  if (timestamps.length === 0 || rawCloses.length === 0) {
    throw new Error(`Yahoo ${symbol}: no history returned`);
  }

  const closes: number[] = [];
  const volumes: number[] = [];
  let asOf: string | null = null;

  for (let i = 0; i < rawCloses.length; i++) {
    const close = Number(rawCloses[i]);
    if (!Number.isFinite(close) || close <= 0) continue;
    closes.push(close);
    volumes.push(Number(rawVolumes[i]) || 0);
    if (timestamps[i]) asOf = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
  }

  if (closes.length < 60) throw new Error(`Yahoo ${symbol}: only ${closes.length} closes`);
  return { symbol, closes, volumes, latestPrice: closes[closes.length - 1], asOf };
}

async function fetchKraken(symbol: string) {
  const pair = krakenPair(symbol);

  for (let attempt = 0; attempt < 3; attempt++) {
    const json = await getJson(`${KRAKEN_URL}?pair=${pair}&interval=1440`, `Kraken ${symbol}`);
    const errors: string[] = json?.error || [];
    if (errors.length > 0) {
      if (errors.some((e) => /too many requests/i.test(e)) && attempt < 2) {
        await sleep(1200 + attempt * 1200);
        continue;
      }
      throw new Error(`Kraken ${symbol}: ${errors.join(', ')}`);
    }

    const result = json?.result || {};
    const key = Object.keys(result).find((k) => k !== 'last');
    const rows = key ? result[key] : null;
    if (!Array.isArray(rows) || rows.length < 60) {
      throw new Error(`Kraken ${symbol}: no history for ${pair}`);
    }

    const closes = rows.map((r: any[]) => Number(r[4])).filter((n: number) => Number.isFinite(n) && n > 0);
    const volumes = rows.map((r: any[]) => Number(r[6]) || 0);
    const lastRow = rows[rows.length - 1];
    const asOf = lastRow ? new Date(Number(lastRow[0]) * 1000).toISOString().slice(0, 10) : null;

    return { symbol, closes, volumes, latestPrice: closes[closes.length - 1], asOf };
  }

  throw new Error(`Kraken ${symbol}: rate limited`);
}

export async function fetchSeries(symbol: string, assetClass: string) {
  if (assetClass === 'crypto') return fetchKraken(symbol);
  try {
    return await fetchNasdaq(symbol, assetClass);
  } catch (error) {
    try {
      return await fetchYahoo(symbol);
    } catch {
      throw error;
    }
  }
}