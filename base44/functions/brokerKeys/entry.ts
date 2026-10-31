import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { sealSecret, lastFour } from '../../shared/brokerCredentials.ts';

// Stores the signed-in user's own broker keys. The keys are sealed before they
// are written and are never returned — only a masked hint for the owner, so a
// connected account can be recognised without exposing the secret.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action === 'clear' ? 'clear' : 'save';
    const broker = String(body?.broker || '').toLowerCase();
    if (!['kraken', 'alpaca', 'all'].includes(broker)) {
      return Response.json({ error: 'Unknown broker' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const existing = await sr.entities.BrokerCredential.filter({ owner_id: user.id });
    const record = existing?.[0] || null;

    const clean = (value) => (typeof value === 'string' ? value.trim().slice(0, 300) : '');
    const patch = { owner_id: user.id };

    if (action === 'save') {
      const apiKey = clean(body?.apiKey);
      const apiSecret = clean(body?.apiSecret);
      if (!apiKey || !apiSecret) {
        return Response.json({ error: 'Enter both the API key and the API secret' }, { status: 400 });
      }
      // A single save always targets one broker, never both at once.
      const target = broker === 'all' ? null : broker;
      if (!target) return Response.json({ error: 'Choose Kraken or Alpaca' }, { status: 400 });

      patch[`${target}_key`] = await sealSecret(apiKey);
      patch[`${target}_secret`] = await sealSecret(apiSecret);
      patch[`${target}_hint`] = lastFour(apiKey);
    } else if (broker === 'kraken' || broker === 'all') {
      patch.kraken_key = '';
      patch.kraken_secret = '';
      patch.kraken_hint = '';
    } else if (broker === 'alpaca' || broker === 'all') {
      patch.alpaca_key = '';
      patch.alpaca_secret = '';
      patch.alpaca_hint = '';
    }

    const saved = record
      ? await sr.entities.BrokerCredential.update(record.id, patch)
      : await sr.entities.BrokerCredential.create(patch);

    return Response.json({
      saved: true,
      kraken: { configured: Boolean(saved?.kraken_key), hint: saved?.kraken_hint || null },
      alpaca: { configured: Boolean(saved?.alpaca_key), hint: saved?.alpaca_hint || null },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}