// Builds the daily plain-text (markdown) report the bot saves for its owner.
// Pure formatting: it receives records that were already fetched and returns a
// document — no database or network access in here.

const usd = (n) =>
  `$${Number(n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const signedUsd = (n) => `${Number(n) >= 0 ? '+' : '-'}${usd(Math.abs(Number(n ?? 0)))}`;
const pct = (n) => `${Number(n) >= 0 ? '+' : ''}${Number(n ?? 0).toFixed(2)}%`;

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  return [head, divider, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

export function buildBotReport(data) {
  const { user, config, runs, trades, positions, signals, generatedAt } = data;

  const starting = Number(config?.starting_cash ?? 100000);
  const latestRun = (runs || [])[0] || null;
  const equity = Number(latestRun?.equity ?? starting);
  const pnl = equity - starting;

  const closed = (trades || []).filter((t) => t.side === 'sell' && t.realized_pnl != null);
  const realizedToday = closed.reduce((sum, t) => sum + Number(t.realized_pnl || 0), 0);
  const opened = (trades || []).filter((t) => t.side === 'buy');

  const rankedSignals = [...(signals || [])].sort(
    (a, b) => Number(b.expected_gain_pct ?? 0) - Number(a.expected_gain_pct ?? 0)
  );
  const byMomentum = [...(signals || [])].sort(
    (a, b) => Number(b.momentum_20d_pct ?? 0) - Number(a.momentum_20d_pct ?? 0)
  );
  const gainers = byMomentum.slice(0, 3);
  const losers = byMomentum.slice(-3).reverse();

  const lines = [];
  lines.push(`# Market Bot — daily report`);
  lines.push('');
  lines.push(`**Owner:** ${user.full_name || user.email}`);
  lines.push(`**Generated:** ${new Date(generatedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} (New York)`);
  lines.push(`**Mode:** ${config?.live_enabled ? 'Live trading enabled' : 'Paper trading only'}`);
  lines.push(`**Scans in the last 24 hours:** ${(runs || []).length}`);
  lines.push('');

  lines.push('## Portfolio');
  lines.push('');
  lines.push(`- **Total equity:** ${usd(equity)}`);
  lines.push(`- **Profit / loss since inception:** ${signedUsd(pnl)} (${pct((pnl / starting) * 100)})`);
  lines.push(`- **Paper cash:** ${usd(config?.cash_balance)}`);
  if (config?.live_cash != null) lines.push(`- **Broker cash:** ${usd(config.live_cash)}`);
  lines.push(`- **Open positions:** ${(positions || []).length}`);
  lines.push('');

  lines.push('## Closed today');
  lines.push('');
  if (closed.length === 0) {
    lines.push('_No positions were closed in the last 24 hours._');
  } else {
    lines.push(`**Realized result:** ${signedUsd(realizedToday)}`);
    lines.push('');
    lines.push(
      table(
        ['Asset', 'Side', 'Units', 'Entry', 'Exit', 'Result', 'Why'],
        closed.map((t) => [
          t.symbol,
          t.venue || t.mode || 'paper',
          Number(t.quantity).toFixed(6).replace(/0+$/, '').replace(/\.$/, ''),
          '—',
          usd(t.price),
          `${signedUsd(t.realized_pnl)} (${pct(t.realized_pct)})`,
          String(t.reason || '').replace(/\|/g, '/'),
        ])
      )
    );
  }
  lines.push('');

  lines.push('## Opened today');
  lines.push('');
  if (opened.length === 0) {
    lines.push('_No new positions were opened in the last 24 hours._');
  } else {
    lines.push(
      table(
        ['Asset', 'Venue', 'Units', 'Price', 'Notional', 'Score', 'Est. 10-day gain'],
        opened.map((t) => {
          const signal = rankedSignals.find((s) => s.symbol === t.symbol);
          return [
            t.symbol,
            t.venue || t.mode || 'paper',
            Number(t.quantity).toFixed(6).replace(/0+$/, '').replace(/\.$/, ''),
            usd(t.price),
            usd(t.notional),
            t.score ?? '—',
            signal?.expected_gain_pct != null ? pct(signal.expected_gain_pct) : '—',
          ];
        })
      )
    );
  }
  lines.push('');

  lines.push('## Open positions');
  lines.push('');
  if (!positions || positions.length === 0) {
    lines.push('_No open positions._');
  } else {
    lines.push(
      table(
        ['Asset', 'Venue', 'Units', 'Avg cost', 'Last', 'Market value', 'Unrealized'],
        positions.map((p) => [
          p.symbol,
          p.venue || 'paper',
          Number(p.quantity).toFixed(6).replace(/0+$/, '').replace(/\.$/, ''),
          usd(p.avg_cost),
          usd(p.last_price),
          usd(p.market_value),
          p.unrealized_pct == null ? '—' : pct(p.unrealized_pct),
        ])
      )
    );
  }
  lines.push('');

  lines.push('## Market analysis — highest estimated gain');
  lines.push('');
  lines.push(
    table(
      ['Asset', 'Price', 'Score', 'Signal', '20d', 'Est. 10-day gain', 'Est. risk'],
      rankedSignals.slice(0, 8).map((s) => [
        s.symbol,
        usd(s.price),
        s.score,
        s.action,
        s.momentum_20d_pct == null ? '—' : pct(s.momentum_20d_pct),
        s.expected_gain_pct == null ? '—' : pct(s.expected_gain_pct),
        s.risk_pct == null ? '—' : `${Number(s.risk_pct).toFixed(1)}%`,
      ])
    )
  );
  lines.push('');

  lines.push('## Biggest movers');
  lines.push('');
  lines.push(`- **Up:** ${gainers.map((s) => `${s.symbol} ${pct(s.momentum_20d_pct)}`).join(', ') || '—'}`);
  lines.push(`- **Down:** ${losers.map((s) => `${s.symbol} ${pct(s.momentum_20d_pct)}`).join(', ') || '—'}`);
  lines.push('');

  lines.push('## What the bot learned');
  lines.push('');
  lines.push(`- **Win rate:** ${config?.win_rate == null ? 'not enough closed trades yet' : `${config.win_rate}%`}`);
  lines.push(`- **Closed trades measured:** ${config?.closed_trades ?? 0}`);
  lines.push(`- **Entry score in force:** ${config?.learned_entry_score ?? config?.min_entry_score ?? '—'}`);
  if (config?.learning_note) lines.push(`- ${config.learning_note}`);
  if (config?.broker_note) lines.push(`- **Broker note:** ${config.broker_note}`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(
    'Estimates are arithmetic projections from recent price behaviour, not forecasts, and no strategy can guarantee profit. ' +
      'This document is a record of what the bot did, not investment advice.'
  );

  return lines.join('\n');
}