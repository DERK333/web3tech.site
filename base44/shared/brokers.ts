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
// for the key, and reports a repeat as "EGeneral:Temporary lockout". Numbers
// stay exact by going through BigInt, the offset steps past any window another
// client may have already consumed, and the counter separates calls that land
// in the same millisecond.
const NONCE_SCALE = 1000000n;
const NONCE_OFFSET = 1000000000000000n;
let nonceCounter = 0n;
const krakenNonce = (bump = 0n) =>
  (BigInt(Date.now()) * NONCE_SCALE + NONCE_OFFSET + bump + nonceCounter++).toString();

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

  // A stale nonce window clears by simply sending a much higher one.
  const staleNonce = first.error.some((e) => /nonce|lockout/i.test(e));
  if (staleNonce) {
    const retry = await send(krakenNonce(NONCE_OFFSET));
    if (!retry?.error?.length) return retry.result;
    throw new Error(retry.error.join(", "));
  }

  throw new Error(first.error.join(", "));
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

const alpacaRequest = async (keys, path, options = {}, paper = true) => {
  if (!keys?.key || !keys?.secret) throw new Error("No Alpaca API key is connected");
  const base = paper ? ALPACA_PAPER : ALPACA_LIVE;
  const authHeaders = {
    "APCA-API-KEY-ID": keys.key,
    "APCA-API-SECRET-KEY": keys.secret,
    "Content-Type": "application/json",
  };
  const res = await fetch(`${base}${path}`, {
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

  // A key pair only works in the environment it was issued for. Say which one
  // it is instead of letting the account silently trade real money.
  if (!res.ok && res.status === 401) {
    const other = paper ? ALPACA_LIVE : ALPACA_PAPER;
    const probe = await fetch(`${other}/v2/account`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (probe.ok) {
      throw new Error(
        paper
          ? 'These Alpaca keys belong to a live account — turn off "Alpaca paper account" in Brokers to trade stocks and ETFs with them'
          : 'These Alpaca keys belong to a paper account — turn on "Alpaca paper account" in Brokers to use them'
      );
    }
  }

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
};

export const alpacaAccount = async (keys, paper = true) => {
  const account = await alpacaRequest(keys, "/v2/account", {}, paper);
  return {
    cash: Number(account?.cash) || 0,
    equity: Number(account?.equity) || 0,
    paper,
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