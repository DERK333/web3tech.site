import { secrets } from "base44:runtime";

// Broker adapters for the market bot.
//   Kraken  — crypto spot orders (USD pairs)
//   Alpaca  — US stocks and ETFs (paper or live account)
//
// Every call takes the credential pair it should act with. No key is ever read
// here on its own: the calling function resolves the account it belongs to, so
// one user's bot can never touch another user's broker.
//
// Every order is a market order sized by the caller. This module never decides
// how much to trade — the strategy does — it only signs and sends.

const KRAKEN_API = "https://api.kraken.com";
const ALPACA_LIVE = "https://api.alpaca.markets";
const ALPACA_PAPER = "https://paper-api.alpaca.markets";
const TIMEOUT_MS = 15000;

// Kraken's own naming for a couple of assets.
const KRAKEN_BASE_ALIAS = { BTC: "XBT", DOGE: "XDG" };

// Kraken returns legacy asset codes (XXBT, ZUSD, XETH…). Fold them back to the
// ticker everyone recognises so balances can be priced.
const KRAKEN_ASSET_NAME = { XBT: "BTC", XDG: "DOGE" };
const KRAKEN_STABLE = ["USDT", "USDC", "DAI", "TUSD", "PYUSD"];

const normalizeKrakenAsset = (asset) => {
  let name = String(asset || "").toUpperCase();
  if (name.length === 4 && /^[XZ]/.test(name)) name = name.slice(1);
  return KRAKEN_ASSET_NAME[name] || name;
};

const encoder = new TextEncoder();

const b64ToBytes = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const bytesToB64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

// The app owner's own keys, kept in app secrets. Only ever used as a fallback
// for the admin account; every other user must connect their own.
export const envKrakenKeys = () => {
  const key = secrets.get("KRAKEN_API_KEY");
  const secret = secrets.get("KRAKEN_API_SECRET");
  return key && secret ? { key, secret } : null;
};

export const envAlpacaKeys = () => {
  const key = secrets.get("ALPACA_API_KEY");
  const secret = secrets.get("ALPACA_API_SECRET");
  return key && secret ? { key, secret } : null;
};

const krakenPublic = async (path) => {
  const res = await fetch(`${KRAKEN_API}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const data = await res.json();
  if (data?.error?.length) throw new Error(data.error.join(", "));
  return data.result;
};

// Kraken rejects any nonce that is not strictly larger than the last one used
// for the key. Wall-clock microseconds rise on their own; the stored last value
// only steps in when two calls land inside the same millisecond, so a nonce
// never jumps far ahead of the clock (a jump would make every later call look
// stale and get the key locked out).
const NONCE_SCALE = 1000000n;
let lastNonce = 0n;
const krakenNonce = () => {
  const candidate = BigInt(Date.now()) * NONCE_SCALE;
  const next = candidate > lastNonce ? candidate : lastNonce + 1n;
  lastNonce = next;
  return next.toString();
};

const krakenPrivate = async (keys, methodPath, params = {}) => {
  if (!keys?.key || !keys?.secret) throw new Error("No Kraken API key is connected");

  const send = async (nonce) => {
    const body = new URLSearchParams({ nonce, ...params }).toString();

    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(nonce + body));
    const pathBytes = encoder.encode(methodPath);
    const message = new Uint8Array(pathBytes.length + hash.byteLength);
    message.set(pathBytes, 0);
    message.set(new Uint8Array(hash), pathBytes.length);

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      b64ToBytes(keys.secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signature = bytesToB64(await crypto.subtle.sign("HMAC", hmacKey, message));

    const res = await fetch(`${KRAKEN_API}${methodPath}`, {
      method: "POST",
      headers: {
        "API-Key": keys.key,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.json();
  };

  const first = await send(krakenNonce());
  if (!first?.error?.length) return first.result;

  const errors = first.error.map(String);

  // A lockout is Kraken pausing the key after rejected calls. Retrying only
  // lengthens it, so stop here and let the next scheduled call find it clear.
  if (errors.some((e) => /lockout/i.test(e))) {
    throw new Error(
      'Kraken is temporarily holding API calls for this key. It clears on its own within about 15 minutes; the bot stops calling Kraken until then and reconnects automatically.'
    );
  }

  // A genuinely stale nonce clears by resending with the next number up.
  if (errors.some((e) => /nonce/i.test(e))) {
    const retry = await send(krakenNonce());
    if (!retry?.error?.length) return retry.result;
    throw new Error(retry.error.join(", "));
  }

  throw new Error(errors.join(", "));
};

const findKrakenPair = async (symbol) => {
  const pairs = await krakenPublic("/0/public/AssetPairs");
  const wanted = (KRAKEN_BASE_ALIAS[symbol] || symbol).toUpperCase();
  for (const [name, info] of Object.entries(pairs || {})) {
    const [base, quote] = String(info?.wsname || "").split("/");
    if (base?.toUpperCase() === wanted && quote?.toUpperCase() === "USD") {
      return {
        pair: info.altname || name,
        lotDecimals: Number(info.lot_decimals ?? 8),
        minVolume: Number(info.ordermin ?? 0),
        minCost: Number(info.costmin ?? 0),
      };
    }
  }
  return null;
};

export const krakenUsdBalance = async (keys) => {
  const result = await krakenPrivate(keys, "/0/private/Balance");
  return Number(result?.ZUSD ?? result?.USD ?? 0) || 0;
};

// Whole-account value: idle USD plus every crypto balance marked to Kraken's
// latest trade price, so a funded account never reports just its spare change.
export const krakenAccountValue = async (keys) => {
  const balances = await krakenPrivate(keys, "/0/private/Balance");
  let cash = 0;
  const crypto = {};

  for (const [asset, raw] of Object.entries(balances || {})) {
    const quantity = Number(raw) || 0;
    if (!(quantity > 0)) continue;
    const name = normalizeKrakenAsset(asset);
    if (name === "USD") {
      cash += quantity;
      continue;
    }
    crypto[name] = (crypto[name] || 0) + quantity;
  }

  const assets = Object.keys(crypto);
  if (!assets.length) return { cash, cryptoValue: 0, total: cash, holdings: [] };

  const pairs = await krakenPublic("/0/public/AssetPairs");
  const usdPairs = {};
  for (const [name, info] of Object.entries(pairs || {})) {
    const [base, quote] = String(info?.wsname || "").split("/");
    if (!base || quote?.toUpperCase() !== "USD") continue;
    const key = normalizeKrakenAsset(base.toUpperCase());
    if (!usdPairs[key]) usdPairs[key] = { canonical: name, altname: info.altname || name };
  }

  const query = assets.filter((asset) => usdPairs[asset]).map((asset) => usdPairs[asset].altname);
  const prices = {};
  if (query.length) {
    const tickers = await krakenPublic(`/0/public/Ticker?pair=${query.join(",")}`);
    for (const [pairName, item] of Object.entries(tickers || {})) {
      const price = Number(item?.c?.[0]);
      if (!Number.isFinite(price) || !(price > 0)) continue;
      for (const [asset, pair] of Object.entries(usdPairs)) {
        if (pair.canonical === pairName || pair.altname === pairName) {
          prices[asset] = price;
          break;
        }
      }
    }
  }

  const holdings = assets.map((asset) => {
    const quantity = crypto[asset];
    const price = prices[asset] ?? (KRAKEN_STABLE.includes(asset) ? 1 : 0);
    return { asset, quantity, price, value: quantity * price };
  });
  const cryptoValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return { cash, cryptoValue, total: cash + cryptoValue, holdings };
};

// Buys `usdAmount` of the asset. Kraken's viqc flag means volume is quoted in
// the pair's quote currency, so the order is sized in dollars directly.
export const krakenBuy = async (keys, symbol, usdAmount) => {
  const market = await findKrakenPair(symbol);
  if (!market) throw new Error(`Kraken does not list ${symbol}/USD`);
  const usd = Math.round(Number(usdAmount) * 100) / 100;
  if (usd < market.minCost) {
    throw new Error(`$${usd} is below Kraken's $${market.minCost} minimum for ${symbol}`);
  }
  const result = await krakenPrivate(keys, "/0/private/AddOrder", {
    pair: market.pair,
    type: "buy",
    ordertype: "market",
    volume: usd.toFixed(2),
    oflags: "viqc",
  });
  return { orderId: result?.txid?.[0] || null, pair: market.pair, usd };
};

export const krakenSell = async (keys, symbol, quantity) => {
  const market = await findKrakenPair(symbol);
  if (!market) throw new Error(`Kraken does not list ${symbol}/USD`);
  const volume = Number(Number(quantity).toFixed(market.lotDecimals));
  if (!(volume > 0)) throw new Error(`${symbol}: quantity rounds to zero at Kraken's precision`);
  if (volume < market.minVolume) {
    throw new Error(`${symbol}: ${volume} is below Kraken's ${market.minVolume} minimum lot`);
  }
  const result = await krakenPrivate(keys, "/0/private/AddOrder", {
    pair: market.pair,
    type: "sell",
    ordertype: "market",
    volume: String(volume),
  });
  return { orderId: result?.txid?.[0] || null, pair: market.pair, volume };
};

// A key pair only works in the environment it was issued for. Rather than
// rejecting a live key because a paper switch is on (which used to read as a
// broken connection), the call follows the key to the environment that accepts
// it and reports back which one answered.
const alpacaCall = async (keys, path, options = {}, preferredPaper = true) => {
  if (!keys?.key || !keys?.secret) throw new Error("No Alpaca API key is connected");

  const authHeaders = {
    "APCA-API-KEY-ID": keys.key,
    "APCA-API-SECRET-KEY": keys.secret,
    "Content-Type": "application/json",
  };

  const attempt = async (usePaper) => {
    const res = await fetch(`${usePaper ? ALPACA_PAPER : ALPACA_LIVE}${path}`, {
      ...options,
      headers: authHeaders,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return { res, data, paper: usePaper };
  };

  let result = await attempt(preferredPaper);

  // 401 means the keys were issued for the other environment. An order rejected
  // with 401 was never placed, so retrying it there is safe.
  if (result.res.status === 401) {
    const alternate = await attempt(!preferredPaper);
    if (alternate.res.ok) result = alternate;
  }

  if (!result.res.ok) {
    throw new Error(result.data?.message || `HTTP ${result.res.status}`);
  }
  return result;
};

const alpacaRequest = async (keys, path, options = {}, paper = true) =>
  (await alpacaCall(keys, path, options, paper)).data;

export const alpacaAccount = async (keys, paper = true) => {
  const { data: account, paper: resolved } = await alpacaCall(keys, "/v2/account", {}, paper);
  return {
    cash: Number(account?.cash) || 0,
    equity: Number(account?.equity) || 0,
    paper: resolved,
  };
};

export const alpacaBuy = async (keys, symbol, usdAmount, paper = true) => {
  const notional = Math.round(Number(usdAmount) * 100) / 100;
  if (!(notional > 0)) throw new Error(`${symbol}: order size rounds to zero`);
  const order = await alpacaRequest(
    keys,
    "/v2/orders",
    {
      method: "POST",
      body: JSON.stringify({
        symbol,
        notional: notional.toFixed(2),
        side: "buy",
        type: "market",
        time_in_force: "day",
      }),
    },
    paper
  );
  return { orderId: order?.id || null, notional };
};

// Omitting qty liquidates the whole position — what an exit means here.
export const alpacaSell = async (keys, symbol, paper = true) => {
  const order = await alpacaRequest(
    keys,
    "/v2/orders",
    {
      method: "POST",
      body: JSON.stringify({ symbol, side: "sell", type: "market", time_in_force: "day" }),
    },
    paper
  );
  return { orderId: order?.id || null };
};