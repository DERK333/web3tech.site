import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  krakenConfigured,
  alpacaConfigured,
  krakenUsdBalance,
  alpacaAccount,
} from '../../shared/brokers.ts';

// Reports whether the brokers are reachable and what they hold. Places no orders.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const configs = await base44.entities.BotConfig.list('-created_date', 1);
    const config = configs && configs.length ? configs[0] : null;
    const alpacaPaper = config?.alpaca_paper !== false;

    const kraken = { configured: krakenConfigured(), ok: false, cash: null, error: null };
    if (kraken.configured) {
      try {
        kraken.cash = await krakenUsdBalance();
        kraken.ok = true;
      } catch (error) {
        kraken.error = error.message;
      }
    }

    const alpaca = {
      configured: alpacaConfigured(),
      ok: false,
      cash: null,
      equity: null,
      paper: alpacaPaper,
      error: null,
    };
    if (alpaca.configured) {
      try {
        const account = await alpacaAccount(alpacaPaper);
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