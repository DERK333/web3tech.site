import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  envKrakenKeys,
  envAlpacaKeys,
  krakenAccountValue,
  alpacaAccount,
} from '../../shared/brokers.ts';
import { loadBrokerCredentials, hasKeys } from '../../shared/brokerCredentials.ts';

// Reports whether the signed-in user's own brokers are reachable and what they
// hold. Keys are resolved from that user's encrypted vault only — the app
// owner's keys are used solely as a fallback for the admin account. Never
// returns key material. Places no orders.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole;
    const own = await loadBrokerCredentials(sr, user.id);

    let krakenKeys = hasKeys(own.kraken) ? { key: own.kraken.key, secret: own.kraken.secret } : null;
    let alpacaKeys = hasKeys(own.alpaca) ? { key: own.alpaca.key, secret: own.alpaca.secret } : null;
    let krakenFromApp = false;
    let alpacaFromApp = false;

    // Only the app owner falls back to the keys stored in app secrets.
    if (!krakenKeys && user.role === 'admin') {
      krakenKeys = envKrakenKeys();
      krakenFromApp = Boolean(krakenKeys);
    }
    if (!alpacaKeys && user.role === 'admin') {
      alpacaKeys = envAlpacaKeys();
      alpacaFromApp = Boolean(alpacaKeys);
    }

    const configs = await sr.entities.BotConfig.filter({ owner_id: user.id }, { limit: 1 });
    const alpacaPaper = (configs?.items?.[0] || configs?.[0])?.alpaca_paper !== false;

    const kraken = {
      configured: Boolean(krakenKeys),
      own_key: hasKeys(own.kraken),
      app_key: krakenFromApp,
      hint: own.kraken.hint,
      ok: false,
      cash: null,
      crypto_value: null,
      total: null,
      holdings: [],
      error: null,
    };
    if (krakenKeys) {
      try {
        const account = await krakenAccountValue(krakenKeys);
        kraken.cash = account.cash;
        kraken.crypto_value = account.cryptoValue;
        kraken.total = account.total;
        kraken.holdings = account.holdings;
        kraken.ok = true;
      } catch (error) {
        kraken.error = error.message;
      }
    }

    const alpaca = {
      configured: Boolean(alpacaKeys),
      own_key: hasKeys(own.alpaca),
      app_key: alpacaFromApp,
      hint: own.alpaca.hint,
      ok: false,
      cash: null,
      equity: null,
      paper: alpacaPaper,
      error: null,
    };
    if (alpacaKeys) {
      try {
        const account = await alpacaAccount(alpacaKeys, alpacaPaper);
        alpaca.cash = account.cash;
        alpaca.equity = account.equity;
        alpaca.ok = true;
      } catch (error) {
        alpaca.error = error.message;
      }
    }

    return Response.json({ kraken, alpaca });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}