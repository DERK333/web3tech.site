import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { fetchSeries } from '../../shared/marketData.ts';
import { scoreAsset } from '../../shared/indicators.ts';

// The market bot. One call = one full cycle:
//   1. pull daily candles for every enabled asset (public, key-free sources)
//   2. score each on trend / momentum / RSI / volatility
//   3. store the signals
//   4. manage the simulated portfolio: exits first, then new entries
//   5. log the run
//
// PAPER TRADING ONLY. No brokerage is connected and no real order is ever
// placed by this function. It trades a simulated cash balance so the
// strategy can be judged on real market data before any money is at risk.

const DEFAULTS = {
  mode: 'paper',
  starting_cash: 100000,
  max_position_pct: 12,
  max_positions: 8,
  min_entry_score: 66,
  stop_loss_pct: 8,
  take_profit_pct: 30,
};

const MIN_SCAN_GAP_MS = 5 * 60 * 1000;

const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const units = (n) => Math.round((Number(n) + Number.EPSILON) * 1e6) / 1e6;
const todayKey = () => new Date().toISOString().slice(0, 10);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Called from the admin screen, and by the scheduled workflow (which runs
    // as its creator, an app admin). Admin only either way.
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const sr = base44.asServiceRole;

    // ---- config (singleton) ------------------------------------------------
    const configs = await sr.entities.BotConfig.list('-created_date', 1);
    let config = configs && configs.length ? configs[0] : null;
    if (!config) {
      config = await sr.entities.BotConfig.create({
        ...DEFAULTS,
        cash_balance: DEFAULTS.starting_cash,
      });
    }
    if (config.cash_balance == null) {
      config = await sr.entities.BotConfig.update(config.id, { cash_balance: config.starting_cash ?? DEFAULTS.starting_cash });
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

    // ---- assets ------------------------------------------------------------
    const assets = await sr.entities.BotAsset.filter({ enabled: true });
    if (!assets || assets.length === 0) {
      return Response.json({ status: 'skipped', message: 'No enabled assets to scan.' });
    }

    const startedAt = new Date().toISOString();
    const scanned = [];
    const failures = [];

    // Small sequential batches, with a short pause between them, so the free
    // public endpoints do not rate-limit the scan.
    for (let i = 0; i < assets.length; i += 3) {
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 400));
      const batch = assets.slice(i, i + 3);
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

    // ---- signals (one live row per asset) ---------------------------------
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

    // ---- portfolio --------------------------------------------------------
    const stopLoss = Number(config.stop_loss_pct ?? DEFAULTS.stop_loss_pct);
    const takeProfit = Number(config.take_profit_pct ?? DEFAULTS.take_profit_pct);
    const maxPositions = Number(config.max_positions ?? DEFAULTS.max_positions);
    const maxPositionPct = Number(config.max_position_pct ?? DEFAULTS.max_position_pct);
    const minEntryScore = Number(config.min_entry_score ?? DEFAULTS.min_entry_score);

    let cash = Number(config.cash_balance ?? config.starting_cash ?? DEFAULTS.starting_cash);

    const allPositions = await sr.entities.BotPosition.list();
    const positions = allPositions || [];

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

    const markedValue = positions.reduce((sum, p) => {
      const price = priceMap.get(p.symbol.toUpperCase()) ?? p.last_price ?? p.avg_cost;
      return sum + p.quantity * price;
    }, 0);
    const equityAtStart = cash + markedValue;

    // Daily guard: at most one round of trading per symbol per calendar day.
    const recentTrades = await sr.entities.BotTrade.list('-created_date', 200);
    const tradedToday = new Set(
      (recentTrades || [])
        .filter((t) => String(t.created_date || '').slice(0, 10) === todayKey())
        .map((t) => t.symbol)
    );

    const trades = [];
    const closed = [];
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

      const proceeds = money(p.quantity * price);
      cash += proceeds;
      const trade = {
        symbol,
        asset_class: p.asset_class,
        side: 'sell',
        quantity: units(p.quantity),
        price,
        notional: proceeds,
        score: signal.score,
        reason,
        mode: 'paper',
        executed_at: new Date().toISOString(),
      };
      trades.push(trade);
      closed.push({ symbol, pnl: money(pnl), reason });
      tradedToday.add(symbol);
      await sr.entities.BotPosition.delete(p.id);
    }

    // ---- entries ----------------------------------------------------------
    const held = new Set(keptPositions.map((p) => p.symbol.toUpperCase()));
    let investedValue = keptPositions.reduce((sum, p) => {
      const price = priceMap.get(p.symbol.toUpperCase()) ?? p.last_price ?? p.avg_cost;
      return sum + p.quantity * price;
    }, 0);

    const candidates = liveSignals
      .filter(
        (s) =>
          (s.action === 'strong_buy' || s.action === 'buy') &&
          Number(s.score) >= minEntryScore &&
          !held.has(s.symbol) &&
          !tradedToday.has(s.symbol) &&
          Number(s.price) > 0
      )
      .sort((a, b) => Number(b.score) - Number(a.score));

    const opened = [];
    let openCount = keptPositions.length;

    for (const candidate of candidates) {
      if (openCount >= maxPositions) break;

      const equity = cash + investedValue;
      const target = money((equity * maxPositionPct) / 100);
      const notional = money(Math.min(target, cash));
      if (notional < 50) break;

      const price = Number(candidate.price);
      const quantity = units(notional / price);
      if (quantity <= 0) continue;
      const cost = money(quantity * price);
      if (cost > cash) continue;

      cash = money(cash - cost);
      investedValue += cost;

      const position = await sr.entities.BotPosition.create({
        symbol: candidate.symbol,
        asset_class: candidate.asset_class,
        quantity,
        avg_cost: price,
        last_price: price,
        market_value: cost,
        unrealized_pct: 0,
        opened_at: new Date().toISOString(),
      });

      const trade = {
        symbol: candidate.symbol,
        asset_class: candidate.asset_class,
        side: 'buy',
        quantity,
        price,
        notional: cost,
        score: candidate.score,
        reason: `Score ${candidate.score} — ${candidate.rationale}`,
        mode: 'paper',
        executed_at: new Date().toISOString(),
      };
      trades.push(trade);
      opened.push({ symbol: candidate.symbol, notional: cost, score: candidate.score });

      held.add(candidate.symbol);
      tradedToday.add(candidate.symbol);
      openCount++;
      void position;
    }

    if (trades.length) await sr.entities.BotTrade.bulkCreate(trades);

    const equity = money(cash + investedValue);
    const summary =
      `Scanned ${scanned.length} asset${scanned.length === 1 ? '' : 's'}` +
      (failures.length ? ` (${failures.length} unavailable)` : '') +
      `. ${liveSignals.length} signals updated. ` +
      `${opened.length} opened, ${closed.length} closed. ` +
      `Paper equity $${equity.toLocaleString('en-US')} with $${money(cash).toLocaleString('en-US')} cash.`;

    await sr.entities.BotConfig.update(config.id, {
      cash_balance: money(cash),
      last_scan_at: now,
      last_summary: summary,
    });

    await sr.entities.BotRun.create({
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      assets_scanned: scanned.length,
      assets_failed: failures.length,
      signals: liveSignals.length,
      trades: trades.length,
      equity,
      cash: money(cash),
      status: failures.length ? 'partial' : 'ok',
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
      equity,
      cash: money(cash),
      top_signals: [...liveSignals]
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, 3)
        .map((s) => ({ symbol: s.symbol, score: s.score, action: s.action })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}