import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { waitUntil } from 'base44:runtime';
import { fetchSeries } from '../../shared/marketData.ts';
import { scoreAsset } from '../../shared/indicators.ts';
import {
  envKrakenKeys,
  envAlpacaKeys,
  krakenUsdBalance,
  alpacaAccount,
  krakenBuy,
  krakenSell,
  alpacaBuy,
  alpacaSell,
} from '../../shared/brokers.ts';
import { loadBrokerCredentials, hasKeys } from '../../shared/brokerCredentials.ts';
import { UNIVERSE } from '../../shared/marketUniverse.ts';

// The market bot. One call = one full cycle for the signed-in user:
//   1. pull daily candles for every enabled asset on their watchlist
//   2. score each on trend / momentum / RSI / volatility
//   3. store the signals
//   4. manage their portfolio: exits first, then new entries
//   5. record what it learned and log the run
//
// Every record — config, watchlist, positions, trades, runs — is stamped with
// the caller's owner_id, and every broker call uses the caller's own encrypted
// keys, so two users' bots never share money, holdings or history.
//
// Live trading is opt-in through BotConfig.live_enabled. When it is off every
// fill is simulated. When it is on, crypto orders go to that user's Kraken
// account and stock/ETF orders to their Alpaca account, each hard-capped by
// max_order_usd and by a cash reserve so an open winner is never sold to fund
// a new idea.

const DEFAULTS = {
  mode: 'paper',
  starting_cash: 100000,
  max_position_pct: 12,
  max_positions: 8,
  min_entry_score: 66,
  max_order_usd: 100,
  min_cash_reserve_pct: 20,
  stop_loss_pct: 8,
  take_profit_pct: 30,
};

const MIN_SCAN_GAP_MS = 5 * 60 * 1000;
const MAX_SCAN_ASSETS = 40;
const MIN_ORDER_USD = 50;

const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const units = (n) => Math.round((Number(n) + Number.EPSILON) * 1e6) / 1e6;
const todayKey = () => new Date().toISOString().slice(0, 10);

const usd = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const VENUE_LABEL = {
  paper: 'Paper portfolio (simulated)',
  kraken: 'Kraken (real money)',
  alpaca: 'Alpaca (real money)',
};

// One short notice per closed position, with the realized result. Email trouble
// never fails a scan: each send is caught and only logged.
async function sendCloseNotices(sr, user, closed) {
  for (const trade of closed) {
    const gain = Number(trade.realized) >= 0;
    try {
      const sent = await sr.integrations.Core.SendEmail({
        to: user.email,
        template_name: 'TradeClosed',
        category: 'transactional',
        variables: {
          symbol: trade.symbol,
          headline: gain
            ? `${trade.symbol} closed in profit`
            : `${trade.symbol} closed at a loss`,
          outcome_word: gain ? 'Profit booked' : 'Loss booked',
          pnl_amount: `${gain ? '+' : '-'}${usd(Math.abs(Number(trade.realized)))}`,
          pnl_pct: `${gain ? '+' : ''}${Number(trade.pnl).toFixed(2)}%`,
          pnl_color: gain ? '#00ffaa' : '#ff6b7a',
          entry_price: usd(trade.avg_cost),
          exit_price: usd(trade.price),
          quantity: String(trade.quantity),
          account: VENUE_LABEL[trade.venue] || VENUE_LABEL.paper,
          reason: trade.reason,
        },
      });
      if (sent?.success === false) {
        console.error(`Close notice for ${trade.symbol} not sent: ${sent.reason || sent.message}`);
      }
    } catch (error) {
      console.error(`Close notice for ${trade.symbol} failed: ${error.message}`);
    }
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ownerId = user.id;
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const sr = base44.asServiceRole;

    // ---- config (one per user) --------------------------------------------
    const configPage = await sr.entities.BotConfig.filter(
      { owner_id: ownerId },
      { sort: '-created_date', limit: 1 }
    );
    let config = configPage?.items?.[0] || null;
    if (!config) {
      config = await sr.entities.BotConfig.create({
        owner_id: ownerId,
        ...DEFAULTS,
        cash_balance: DEFAULTS.starting_cash,
      });
    }
    if (config.cash_balance == null) {
      config = await sr.entities.BotConfig.update(config.id, {
        cash_balance: config.starting_cash ?? DEFAULTS.starting_cash,
      });
    }

    if (!force && config.last_scan_at) {
      const since = Date.now() - new Date(config.last_scan_at).getTime();
      if (since < MIN_SCAN_GAP_MS) {
        return Response.json({
          status: 'skipped',
          message: `Last scan was ${Math.round(since / 1000)}s ago — next scan available shortly.`,
        });
      }
    }

    // ---- assets (watchlist first, then the whole built-in universe) -------
    // The bot does not stop at the watchlist: every liquid name in the universe
    // is scanned too, so a bigger setup elsewhere is never missed.
    const watchlist = (await sr.entities.BotAsset.filter({ owner_id: ownerId, enabled: true })) || [];
    const scanTargets = [];
    const seenSymbols = new Set();
    for (const asset of [...watchlist, ...UNIVERSE]) {
      const symbol = String(asset.symbol || '').toUpperCase().trim();
      if (!symbol || seenSymbols.has(symbol)) continue;
      seenSymbols.add(symbol);
      scanTargets.push({ symbol, asset_class: asset.asset_class });
      if (scanTargets.length >= MAX_SCAN_ASSETS) break;
    }
    if (scanTargets.length === 0) {
      return Response.json({ status: 'skipped', message: 'No assets to scan.' });
    }

    const startedAt = new Date().toISOString();
    const scanned = [];
    const failures = [];

    // Small sequential batches, with a short pause between them, so the free
    // public endpoints do not rate-limit the scan.
    for (let i = 0; i < scanTargets.length; i += 3) {
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 400));
      const batch = scanTargets.slice(i, i + 3);
      const settled = await Promise.allSettled(
        batch.map((a) => fetchSeries(a.symbol, a.asset_class))
      );
      settled.forEach((result, idx) => {
        const asset = batch[idx];
        if (result.status === 'fulfilled') {
          const metrics = scoreAsset(result.value);
          scanned.push({
            symbol: asset.symbol.toUpperCase(),
            asset_class: asset.asset_class,
            asOf: result.value.asOf,
            ...metrics,
          });
        } else {
          failures.push({ symbol: asset.symbol, error: result.reason?.message || 'fetch failed' });
        }
      });
    }

    if (scanned.length === 0) {
      const summary = `Scan failed for every asset (${failures.length}). No data sources responded.`;
      await sr.entities.BotRun.create({
        owner_id: ownerId,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        assets_scanned: 0,
        assets_failed: failures.length,
        signals: 0,
        trades: 0,
        status: 'error',
        summary,
      });
      return Response.json({ status: 'error', message: summary, failures });
    }

    // ---- signals (market data, shared by every user) ----------------------
    const now = new Date().toISOString();
    const existingSignals = await sr.entities.BotSignal.list('-scanned_at', 500);
    const signalBySymbol = new Map((existingSignals || []).map((s) => [s.symbol, s]));

    const toCreate = [];
    const toUpdate = [];
    const liveSignals = [];

    for (const s of scanned) {
      const payload = {
        symbol: s.symbol,
        asset_class: s.asset_class,
        price: s.price,
        score: s.score,
        action: s.action,
        rsi14: s.rsi14,
        sma50_gap_pct: s.gap50,
        sma200_gap_pct: s.gap200,
        momentum_20d_pct: s.mom20,
        momentum_60d_pct: s.mom60,
        volatility_pct: s.vol,
        expected_gain_pct: s.expected_gain_pct,
        risk_pct: s.risk_pct,
        reward_risk: s.reward_risk,
        rationale: s.rationale,
        scanned_at: now,
      };
      const existing = signalBySymbol.get(s.symbol);
      if (existing) {
        toUpdate.push({ id: existing.id, ...payload });
        liveSignals.push({ id: existing.id, ...payload });
      } else {
        toCreate.push(payload);
        liveSignals.push(payload);
      }
    }

    if (toUpdate.length) await sr.entities.BotSignal.bulkUpdate(toUpdate);
    if (toCreate.length) await sr.entities.BotSignal.bulkCreate(toCreate);

    const signalMap = new Map(liveSignals.map((s) => [s.symbol, s]));
    const priceMap = new Map(liveSignals.map((s) => [s.symbol, s.price]));

    // ---- brokers (this user's own accounts) -------------------------------
    const credentials = await loadBrokerCredentials(sr, ownerId);
    let krakenKeys = hasKeys(credentials.kraken)
      ? { key: credentials.kraken.key, secret: credentials.kraken.secret }
      : null;
    let alpacaKeys = hasKeys(credentials.alpaca)
      ? { key: credentials.alpaca.key, secret: credentials.alpaca.secret }
      : null;
    if (!krakenKeys && user.role === 'admin') krakenKeys = envKrakenKeys();
    if (!alpacaKeys && user.role === 'admin') alpacaKeys = envAlpacaKeys();

    const liveEnabled = config.live_enabled === true;
    let alpacaPaper = config.alpaca_paper !== false;
    const orderCap = Number(config.max_order_usd ?? DEFAULTS.max_order_usd);
    const reservePct = Number(config.min_cash_reserve_pct ?? DEFAULTS.min_cash_reserve_pct);

    // One cash pot per place money can sit. Paper is always available; a
    // broker only joins once that user's keys are connected and a balance reads.
    const cashPots = {
      paper: Number(config.cash_balance ?? config.starting_cash ?? DEFAULTS.starting_cash),
      kraken: 0,
      alpaca: 0,
    };
    const brokerNotes = [];

    if (liveEnabled && krakenKeys) {
      try {
        cashPots.kraken = await krakenUsdBalance(krakenKeys);
      } catch (error) {
        brokerNotes.push(`Kraken unavailable: ${error.message}`);
      }
    } else if (liveEnabled) {
      brokerNotes.push('No Kraken key connected — crypto orders fall back to simulation.');
    }

    if (liveEnabled && alpacaKeys) {
      try {
        const account = await alpacaAccount(alpacaKeys, alpacaPaper);
        cashPots.alpaca = account.cash;
        // Follow the keys to the environment they were issued for.
        alpacaPaper = account.paper;
      } catch (error) {
        brokerNotes.push(`Alpaca unavailable: ${error.message}`);
      }
    } else if (liveEnabled) {
      brokerNotes.push('No Alpaca key connected — stock and ETF orders fall back to simulation.');
    }

    const venueFor = (assetClass) => {
      if (assetClass === 'crypto') return cashPots.kraken > 0 ? 'kraken' : 'paper';
      return cashPots.alpaca > 0 ? 'alpaca' : 'paper';
    };

    const totalCash = () => money(cashPots.paper + cashPots.kraken + cashPots.alpaca);

    // ---- strategy limits ---------------------------------------------------
    const stopLoss = Number(config.stop_loss_pct ?? DEFAULTS.stop_loss_pct);
    const takeProfit = Number(config.take_profit_pct ?? DEFAULTS.take_profit_pct);
    const maxPositions = Number(config.max_positions ?? DEFAULTS.max_positions);
    const maxPositionPct = Number(config.max_position_pct ?? DEFAULTS.max_position_pct);

    const positions = (await sr.entities.BotPosition.filter({ owner_id: ownerId })) || [];

    // Mark to market.
    const marks = [];
    for (const p of positions) {
      const price = priceMap.get(p.symbol.toUpperCase());
      if (!price) continue;
      marks.push({
        id: p.id,
        last_price: price,
        market_value: money(p.quantity * price),
        unrealized_pct: p.avg_cost > 0 ? money(((price - p.avg_cost) / p.avg_cost) * 100) : 0,
      });
    }
    if (marks.length) await sr.entities.BotPosition.bulkUpdate(marks);

    let investedValue = positions.reduce((sum, p) => {
      const price = priceMap.get(p.symbol.toUpperCase()) ?? p.last_price ?? p.avg_cost;
      return sum + p.quantity * price;
    }, 0);

    const recentTrades =
      (
        await sr.entities.BotTrade.filter(
          { owner_id: ownerId },
          { sort: '-created_date', limit: 200 }
        )
      )?.items || [];

    // ---- learning ----------------------------------------------------------
    // The bot grades itself on what actually happened: every closed trade logs
    // its realized result, and the win rate over the recent window moves its
    // own entry bar. It becomes more selective when it loses, less selective
    // when it wins — it never claims a guaranteed outcome.
    const autoTune = config.auto_tune !== false;
    const baseScore = Number(config.min_entry_score ?? DEFAULTS.min_entry_score);
    const closedWindow = (recentTrades || [])
      .filter((t) => t.side === 'sell' && t.realized_pct != null)
      .slice(0, 40);
    const wins = closedWindow.filter((t) => Number(t.realized_pct) > 0).length;
    const winRate = closedWindow.length ? Math.round((wins / closedWindow.length) * 100) : null;

    let learned = Number(config.learned_entry_score ?? baseScore);
    let learningNote;

    if (!autoTune) {
      learned = baseScore;
      learningNote = `Self-tuning is off — the entry bar stays where you set it (${baseScore}).`;
    } else if (closedWindow.length < 8) {
      learned = baseScore;
      learningNote = `Collecting results (${closedWindow.length} of 8 closed trades). The entry bar stays at ${baseScore} until it has enough evidence to move.`;
    } else {
      const before = learned;
      if (winRate >= 60) learned -= 1;
      else if (winRate <= 40) learned += 2;
      else learned += learned > baseScore ? -1 : learned < baseScore ? 1 : 0;

      learned = Math.round(
        Math.min(
          Math.max(learned, Math.max(52, baseScore - 10)),
          Math.min(85, baseScore + 10)
        )
      );

      learningNote =
        learned === before
          ? `Win rate ${winRate}% across ${closedWindow.length} closed trades — entry bar held at ${learned}.`
          : `Win rate ${winRate}% across ${closedWindow.length} closed trades — entry bar moved ${before} → ${learned}.`;
    }

    const entryScore = autoTune ? learned : baseScore;

    // Daily guard: at most one round of trading per symbol per calendar day.
    const tradedToday = new Set(
      (recentTrades || [])
        .filter((t) => String(t.created_date || '').slice(0, 10) === todayKey())
        .map((t) => t.symbol)
    );

    const trades = [];
    const closed = [];
    const orderErrors = [];
    const keptPositions = [];

    // ---- exits ------------------------------------------------------------
    for (const p of positions) {
      const symbol = p.symbol.toUpperCase();
      const signal = signalMap.get(symbol);
      const price = signal?.price;
      if (!signal || !price) {
        keptPositions.push(p);
        continue;
      }

      const pnl = p.avg_cost > 0 ? ((price - p.avg_cost) / p.avg_cost) * 100 : 0;
      let reason = null;
      if (pnl <= -stopLoss) reason = `Stop loss — down ${pnl.toFixed(1)}% against a ${stopLoss}% limit`;
      else if (pnl >= takeProfit) reason = `Take profit — up ${pnl.toFixed(1)}% against a ${takeProfit}% target`;
      else if (signal.action === 'avoid') reason = `Trend broken — signal fell to avoid (score ${signal.score})`;
      else if (signal.action === 'trim') reason = `Momentum faded — signal fell to trim (score ${signal.score})`;

      if (!reason) {
        keptPositions.push(p);
        continue;
      }

      if (tradedToday.has(symbol)) {
        keptPositions.push(p);
        continue;
      }

      const venue = p.venue || 'paper';

      // A real exit has to succeed at the broker before the books change.
      if (venue !== 'paper') {
        try {
          if (venue === 'kraken') await krakenSell(krakenKeys, symbol, p.quantity);
          else await alpacaSell(alpacaKeys, symbol, alpacaPaper);
        } catch (error) {
          orderErrors.push(`${symbol} sell: ${error.message}`);
          keptPositions.push(p);
          continue;
        }
      }

      const proceeds = money(p.quantity * price);
      cashPots[venue] = money(cashPots[venue] + proceeds);

      const realized = money((price - p.avg_cost) * p.quantity);
      const realizedPct = p.avg_cost > 0 ? money(((price - p.avg_cost) / p.avg_cost) * 100) : 0;

      trades.push({
        owner_id: ownerId,
        symbol,
        asset_class: p.asset_class,
        side: 'sell',
        quantity: units(p.quantity),
        price,
        notional: proceeds,
        score: signal.score,
        reason,
        mode: venue === 'paper' ? 'paper' : 'live',
        venue,
        realized_pnl: realized,
        realized_pct: realizedPct,
        executed_at: new Date().toISOString(),
      });
      closed.push({
        symbol,
        pnl: realizedPct,
        realized,
        venue,
        reason,
        price,
        avg_cost: p.avg_cost,
        quantity: units(p.quantity),
      });
      tradedToday.add(symbol);
      await sr.entities.BotPosition.delete(p.id);
    }

    // ---- entries ----------------------------------------------------------
    const held = new Set(keptPositions.map((p) => p.symbol.toUpperCase()));

    // Entries are ranked by the largest estimated gain, not by score alone.
    // Assets in a deep downtrend are skipped however strong one week looks.
    const candidates = liveSignals
      .filter(
        (s) =>
          (s.action === 'strong_buy' || s.action === 'buy') &&
          Number(s.score) >= entryScore &&
          !held.has(s.symbol) &&
          !tradedToday.has(s.symbol) &&
          Number(s.price) > 0 &&
          Number(s.expected_gain_pct) > 0 &&
          Number(s.momentum_20d_pct ?? 0) > -20
      )
      .sort(
        (a, b) =>
          Number(b.expected_gain_pct) - Number(a.expected_gain_pct) ||
          Number(b.score) - Number(a.score)
      );

    const opened = [];
    let openCount = keptPositions.length;

    for (const candidate of candidates) {
      if (openCount >= maxPositions) break;

      const venue = venueFor(candidate.asset_class);

      // Only spare cash is deployed: the reserve is never touched, so money
      // already working in a healthy position is never sold to fund a new one.
      const spendable = money(cashPots[venue] * (1 - reservePct / 100));
      if (spendable < MIN_ORDER_USD) continue;

      const equity = totalCash() + investedValue;
      const target = money((equity * maxPositionPct) / 100);
      const notional = money(Math.min(target, orderCap, spendable));
      if (notional < MIN_ORDER_USD) continue;

      const price = Number(candidate.price);
      const quantity = units(notional / price);
      if (quantity <= 0) continue;

      let orderId = null;
      if (venue !== 'paper') {
        try {
          const placed =
            venue === 'kraken'
              ? await krakenBuy(krakenKeys, candidate.symbol, notional)
              : await alpacaBuy(alpacaKeys, candidate.symbol, notional, alpacaPaper);
          orderId = placed?.orderId || null;
        } catch (error) {
          orderErrors.push(`${candidate.symbol} buy: ${error.message}`);
          continue;
        }
      }

      cashPots[venue] = money(cashPots[venue] - notional);
      investedValue += notional;

      await sr.entities.BotPosition.create({
        owner_id: ownerId,
        symbol: candidate.symbol,
        asset_class: candidate.asset_class,
        venue,
        order_id: orderId,
        quantity,
        avg_cost: price,
        last_price: price,
        market_value: notional,
        unrealized_pct: 0,
        opened_at: new Date().toISOString(),
      });

      trades.push({
        owner_id: ownerId,
        symbol: candidate.symbol,
        asset_class: candidate.asset_class,
        side: 'buy',
        quantity,
        price,
        notional,
        score: candidate.score,
        reason:
          `Biggest estimated gain on the board: ${Number(candidate.expected_gain_pct).toFixed(1)}% over about ten sessions ` +
          `(score ${candidate.score}, risk ${Number(candidate.risk_pct).toFixed(1)}%). ${candidate.rationale}`,
        mode: venue === 'paper' ? 'paper' : 'live',
        venue,
        order_id: orderId,
        executed_at: new Date().toISOString(),
      });
      opened.push({
        symbol: candidate.symbol,
        notional,
        score: candidate.score,
        venue,
        expected_gain_pct: candidate.expected_gain_pct,
      });

      held.add(candidate.symbol);
      tradedToday.add(candidate.symbol);
      openCount++;
    }

    if (trades.length) await sr.entities.BotTrade.bulkCreate(trades);

    if (closed.length && user.email) waitUntil(sendCloseNotices(sr, user, closed));

    const equity = money(totalCash() + investedValue);
    const liveVenues = [
      cashPots.kraken > 0 ? 'Kraken' : null,
      cashPots.alpaca > 0 ? (alpacaPaper ? 'Alpaca paper' : 'Alpaca live') : null,
    ].filter(Boolean);

    // Biggest gainers and losers across everything scanned, so the picture is
    // never only the winners the bot happened to buy.
    const rankedByMomentum = [...liveSignals].sort(
      (a, b) => Number(b.momentum_20d_pct ?? 0) - Number(a.momentum_20d_pct ?? 0)
    );
    const moverLabel = (s) =>
      `${s.symbol} ${Number(s.momentum_20d_pct ?? 0) >= 0 ? '+' : ''}${Number(s.momentum_20d_pct ?? 0).toFixed(1)}%`;
    const topGainers = rankedByMomentum.slice(0, 3).map(moverLabel);
    const topLosers = rankedByMomentum.slice(-3).reverse().map(moverLabel);

    const summary =
      `Scanned ${scanned.length} asset${scanned.length === 1 ? '' : 's'}` +
      (failures.length ? ` (${failures.length} unavailable)` : '') +
      `. ${liveSignals.length} signals updated. ` +
      `${opened.length} opened, ${closed.length} closed. ` +
      `${liveEnabled ? `Live via ${liveVenues.length ? liveVenues.join(' + ') : 'no reachable broker'}` : 'Paper only'}` +
      ` — equity $${equity.toLocaleString('en-US')} with $${money(totalCash()).toLocaleString('en-US')} cash.` +
      (orderErrors.length ? ` ${orderErrors.length} order${orderErrors.length === 1 ? '' : 's'} rejected by the broker.` : '') +
      (rankedByMomentum.length
        ? ` 20-day moves — up: ${topGainers.join(', ')}; down: ${topLosers.join(', ')}.`
        : '');

    await sr.entities.BotConfig.update(config.id, {
      mode: liveEnabled ? 'live' : 'paper',
      cash_balance: money(cashPots.paper),
      live_cash: money(cashPots.kraken + cashPots.alpaca),
      learned_entry_score: learned,
      win_rate: winRate,
      closed_trades: closedWindow.length,
      learning_note: learningNote,
      broker_note: [...brokerNotes, ...orderErrors].join(' · ') || '',
      last_scan_at: now,
      last_summary: summary,
    });

    await sr.entities.BotRun.create({
      owner_id: ownerId,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      assets_scanned: scanned.length,
      assets_failed: failures.length,
      signals: liveSignals.length,
      trades: trades.length,
      equity,
      cash: totalCash(),
      status: failures.length || orderErrors.length ? 'partial' : 'ok',
      summary,
    });

    return Response.json({
      status: 'ok',
      summary,
      scanned: scanned.length,
      failed: failures,
      signals: liveSignals.length,
      opened,
      closed,
      order_errors: orderErrors,
      broker_notes: brokerNotes,
      live: liveEnabled,
      equity,
      cash: totalCash(),
      learned_entry_score: learned,
      win_rate: winRate,
      top_signals: [...liveSignals]
        .sort((a, b) => Number(b.expected_gain_pct) - Number(a.expected_gain_pct))
        .slice(0, 3)
        .map((s) => ({
          symbol: s.symbol,
          score: s.score,
          action: s.action,
          expected_gain_pct: s.expected_gain_pct,
        })),
      top_gainers: topGainers,
      top_losers: topLosers,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}