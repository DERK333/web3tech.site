import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildPerpSetups } from '../../shared/perpSetups.ts';

// The bot's perp ideas, for manual placement in Atomic Wallet. There is no
// order path here: no exchange, no key, no execution — just levels.
// The rules live in shared/perpSetups.ts because the scan raises alerts from
// the same setups, and the two must never disagree.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const signals = (await base44.entities.BotSignal.list('-scanned_at', 500)) || [];
    const { setups, eligible } = buildPerpSetups({ signals });

    if (eligible === 0) {
      return Response.json({
        setups: [],
        message: 'No major-coin signals yet — run a market scan first.',
      });
    }

    if (setups.length === 0) {
      return Response.json({
        setups: [],
        message: 'Nothing clears the bar right now — no setup worth forcing.',
      });
    }

    return Response.json({
      setups,
      scanned_signals: eligible,
      note: 'Suggestions only — place them yourself in Atomic. Nothing here sends an order.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}