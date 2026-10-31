// Technical scoring for the market bot.
//
// Everything here is transparent arithmetic on daily closes — moving averages,
// RSI, momentum, realized volatility. Nothing predicts the future; the score
// ranks how well an asset currently trends and how stretched it is.

export function sma(values: number[], period: number): number | null {
  if (!Array.isArray(values) || values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function rsi(values: number[], period = 14): number | null {
  if (!Array.isArray(values) || values.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

export function pctChange(values: number[], days: number): number | null {
  if (!Array.isArray(values) || values.length <= days) return null;
  const now = values[values.length - 1];
  const then = values[values.length - 1 - days];
  if (!then) return null;
  return ((now - then) / then) * 100;
}

// Annualized realized volatility from daily returns, in percent.
export function annualizedVol(values: number[], period = 20): number | null {
  if (!Array.isArray(values) || values.length < period + 1) return null;
  const slice = values.slice(-(period + 1));
  const returns: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    if (slice[i - 1] > 0) returns.push(slice[i] / slice[i - 1] - 1);
  }
  if (returns.length < 5) return null;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function decideAction(score: number, rsi14: number | null, gap200: number | null) {
  // Never chase a blow-off top, even if the trend score is high.
  if (rsi14 != null && rsi14 > 80) return score >= 60 ? 'hold' : 'trim';
  if (score >= 72 && (gap200 == null || gap200 > 0)) return 'strong_buy';
  if (score >= 62) return 'buy';
  if (score >= 45) return 'hold';
  if (score >= 34) return 'trim';
  return 'avoid';
}

// A transparent estimate, not a forecast: how far roughly ten sessions could
// reach if the recent pace holds (damped when the chart is already stretched or
// the 20- and 60-day trends disagree), plus what a normal adverse swing costs.
export function estimateMoves(parts: {
  mom20: number | null;
  mom60: number | null;
  vol: number | null;
  rsi14: number | null;
  score: number;
}) {
  const { mom20, mom60, vol, rsi14, score } = parts;
  const pace = mom20 ?? 0;

  let projected = pace * 0.5;
  if (mom60 != null && Math.sign(mom60) !== Math.sign(pace)) projected *= 0.5;
  if (rsi14 != null && rsi14 > 72) projected *= 0.6;
  if (rsi14 != null && rsi14 >= 45 && rsi14 <= 68) projected *= 1.1;

  const expected = clamp(projected * (0.7 + 0.6 * (score / 100)), -35, 35);
  const dailyVol = (vol ?? 30) / Math.sqrt(252);
  const risk = clamp(dailyVol * Math.sqrt(10) * 1.5, 1, 40);

  return {
    expected_gain_pct: Number(expected.toFixed(2)),
    risk_pct: Number(risk.toFixed(2)),
    reward_risk: Number((expected / risk).toFixed(2)),
  };
}

function buildRationale(parts: {
  gap50: number | null;
  gap200: number | null;
  rsi14: number | null;
  mom20: number | null;
  mom60: number | null;
  vol: number | null;
}) {
  const sentences: string[] = [];
  const { gap50, gap200, rsi14, mom20, mom60, vol } = parts;

  if (gap50 != null) {
    sentences.push(
      gap50 >= 0
        ? `Trading ${gap50.toFixed(1)}% above its 50-day average`
        : `Trading ${Math.abs(gap50).toFixed(1)}% below its 50-day average`
    );
  }
  if (gap200 != null) {
    sentences.push(
      gap200 >= 0
        ? `and ${gap200.toFixed(1)}% above its 200-day average (uptrend intact)`
        : `and ${Math.abs(gap200).toFixed(1)}% below its 200-day average (downtrend)`
    );
  } else {
    sentences.push('with too little history for a 200-day read');
  }

  if (mom20 != null && mom60 != null) {
    sentences.push(
      `Momentum: ${mom20 >= 0 ? '+' : ''}${mom20.toFixed(1)}% over 20 days, ${mom60 >= 0 ? '+' : ''}${mom60.toFixed(1)}% over 60`
    );
  }

  if (rsi14 != null) {
    const state = rsi14 > 75 ? 'overbought' : rsi14 < 35 ? 'oversold' : 'neutral';
    sentences.push(`RSI(14) ${rsi14.toFixed(0)} — ${state}`);
  }

  if (vol != null) {
    const state = vol > 70 ? 'high' : vol > 40 ? 'elevated' : 'contained';
    sentences.push(`realized volatility ${vol.toFixed(0)}% (${state})`);
  }

  return sentences.join(', ').replace(/, and /, ' and ') + '.';
}

export function scoreAsset(series: { symbol: string; closes: number[]; latestPrice: number }) {
  const closes = series.closes || [];
  const price = series.latestPrice;
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi14 = rsi(closes, 14);
  const mom20 = pctChange(closes, 20);
  const mom60 = pctChange(closes, 60);
  const vol = annualizedVol(closes, 20);

  const gap50 = sma50 ? ((price - sma50) / sma50) * 100 : null;
  const gap200 = sma200 ? ((price - sma200) / sma200) * 100 : null;

  let score = 0;

  // Trend — 40 points
  if (gap50 != null && gap50 > 0) score += 20;
  if (sma50 != null && sma200 != null && sma50 > sma200) score += 15;
  if (gap200 != null && gap200 > 0) score += 5;

  // Momentum — 35 points
  if (mom20 != null) score += clamp((mom20 + 10) / 25, 0, 1) * 20;
  if (mom60 != null) score += clamp((mom60 + 20) / 60, 0, 1) * 15;

  // RSI positioning — 15 points (rewards healthy strength, not froth)
  let rsiPoints = 7;
  if (rsi14 != null) {
    if (rsi14 >= 45 && rsi14 <= 68) rsiPoints = 15;
    else if (rsi14 > 68 && rsi14 <= 75) rsiPoints = 10;
    else if (rsi14 > 75) rsiPoints = 3;
    else if (rsi14 >= 35) rsiPoints = 8;
    else rsiPoints = 2;
  }
  score += rsiPoints;

  // Volatility — 10 points (calmer trends rank higher)
  if (vol == null) score += 5;
  else if (vol <= 25) score += 10;
  else if (vol <= 35) score += 8;
  else if (vol <= 50) score += 5;
  else if (vol <= 70) score += 2;

  const finalScore = Math.round(clamp(score, 0, 100));
  const action = decideAction(finalScore, rsi14, gap200);
  const moves = estimateMoves({ mom20, mom60, vol, rsi14, score: finalScore });

  return {
    price: Number(price.toFixed(6)),
    score: finalScore,
    action,
    ...moves,
    rsi14: rsi14 == null ? null : Number(rsi14.toFixed(1)),
    gap50: gap50 == null ? null : Number(gap50.toFixed(2)),
    gap200: gap200 == null ? null : Number(gap200.toFixed(2)),
    mom20: mom20 == null ? null : Number(mom20.toFixed(2)),
    mom60: mom60 == null ? null : Number(mom60.toFixed(2)),
    vol: vol == null ? null : Number(vol.toFixed(1)),
    rationale: buildRationale({ gap50, gap200, rsi14, mom20, mom60, vol }),
  };
}