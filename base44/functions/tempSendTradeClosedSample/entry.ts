import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Temporary: renders the TradeClosed template with sample numbers so the
// notification can be proofread before a real position closes.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sent = await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      template_name: 'TradeClosed',
      category: 'transactional',
      variables: {
        symbol: 'AAPL',
        headline: 'AAPL closed in profit',
        outcome_word: 'Profit booked',
        pnl_amount: '+$3.91',
        pnl_pct: '+3.91%',
        pnl_color: '#00ffaa',
        entry_price: '$344.63',
        exit_price: '$358.10',
        quantity: '0.29',
        account: 'Paper portfolio (simulated)',
        reason: 'Take profit: up 3.9% against a 30% target',
      },
    });
    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}