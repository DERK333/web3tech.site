// Web-grounded catalyst research for the market bot.
//
// The technical score only knows price and volume. This module has a web-search
// model read the last week of news on the few names the bot actually wants to
// buy, so an earnings miss, a hack, a lawsuit or a regulatory action can veto a
// trade the chart alone would take. It is evidence, never a promise of profit:
// the call returns flags and a small tilt, never a guaranteed outcome.

export const RESEARCH_COOLDOWN_MS = 8 * 60 * 60 * 1000;

// One web-search call covers the whole buy list. Six names keeps the prompt
// small, the answer focused, and the cost of a scan bounded.
export const RESEARCH_BATCH = 6;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// The buy list, before money is committed: the strongest names by estimated
// gain, so research is spent where a decision is actually about to be made.
export function pickResearchTargets(signals: any[], limit = RESEARCH_BATCH) {
  return [...(signals || [])]
    .filter(
      (s) =>
        (s?.action === 'strong_buy' || s?.action === 'buy') &&
        Number(s?.score ?? 0) >= 60 &&
        Number(s?.expected_gain_pct ?? 0) > 0
    )
    .sort((a, b) => Number(b.expected_gain_pct ?? 0) - Number(a.expected_gain_pct ?? 0))
    .slice(0, limit)
    .map((s) => ({ symbol: String(s.symbol).toUpperCase(), asset_class: s.asset_class }));
}

const SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Ticker, exactly as given' },
          sentiment: {
            type: 'string',
            enum: ['bullish', 'neutral', 'bearish'],
            description: 'What the recent news implies for the next two weeks',
          },
          catalyst: {
            type: 'string',
            description: 'One sentence naming the specific recent event driving the sentiment',
          },
          risk_flag: {
            type: 'string',
            enum: ['none', 'elevated', 'severe'],
            description:
              'severe = a reason not to hold at all (fraud probe, hack with losses, delisting, bankruptcy talk, halted trading)',
          },
          risk_note: { type: 'string', description: 'One sentence on the main risk, or an empty string' },
          confidence: { type: 'number', description: '0 to 1: how well covered this ticker is in the sources' },
        },
        required: ['symbol', 'sentiment', 'catalyst', 'risk_flag', 'confidence'],
      },
    },
  },
  required: ['results'],
};

function buildPrompt(targets: { symbol: string; asset_class: string }[]) {
  const lines = targets
    .map((t) => `- ${t.symbol} (${t.asset_class === 'crypto' ? 'cryptocurrency' : t.asset_class === 'etf' ? 'ETF' : 'stock'})`)
    .join('\n');

  return `You are a market research desk helping a systematic trading bot avoid buying into bad news.

For each of these tickers:
${lines}

Search the last 7 days of news for each one. Report only what the sources actually say. Focus on:
1. earnings or guidance surprises, product launches, contract wins, upgrades and downgrades
2. hard risks: security breaches, lawsuits, investigations, regulatory action, delisting or listing risk, executive departures, bankruptcy talk
3. for crypto: protocol exploits, exchange or regulatory news, network upgrades, large unlocks

Rules:
- sentiment: your read of how that news affects the price over roughly the next two weeks.
- risk_flag: "severe" only when there is a concrete reason not to hold the asset at all. "elevated" for meaningful uncertainty. "none" when the news is normal or quiet.
- confidence: 0.2 or lower when you could not find recent coverage, and say so in the catalyst.
- Never invent a headline. If the sources disagree, say that in the catalyst.
- This is not financial advice; report the news, do not pitch the trade.

Return one object per ticker, using the exact ticker symbols given above.`;
}

// One call for the whole batch. Returns a Map keyed by upper-case symbol.
export async function researchCandidates(sr, targets: { symbol: string; asset_class: string }[]) {
  const findings = new Map();
  if (!targets?.length) return findings;

  const batch = targets.slice(0, RESEARCH_BATCH);
  const raw = await sr.integrations.Core.InvokeLLM({
    prompt: buildPrompt(batch),
    add_context_from_internet: true,
    response_json_schema: SCHEMA,
  });

  const rows = Array.isArray(raw?.results) ? raw.results : Array.isArray(raw) ? raw : [];

  for (const row of rows) {
    const symbol = String(row?.symbol || '').toUpperCase().trim();
    if (!symbol) continue;

    const sentiment = String(row?.sentiment || 'neutral').toLowerCase();
    const risk = ['none', 'elevated', 'severe'].includes(String(row?.risk_flag))
      ? String(row.risk_flag)
      : 'none';
    const confidence = clamp(Number(row?.confidence ?? 0.4), 0, 1);

    // A few points of tilt either way, and a hard veto on anything that reads
    // like a reason not to own the asset.
    let bias = 0;
    if (sentiment === 'bullish') bias = 8 * confidence;
    else if (sentiment === 'bearish') bias = -12 * confidence;
    if (risk === 'elevated') bias -= 4;
    if (risk === 'severe') bias = Math.min(bias, -15);

    const veto =
      risk === 'severe' ||
      (sentiment === 'bearish' && confidence >= 0.65) ||
      (sentiment === 'bearish' && risk === 'elevated');

    const catalyst = String(row?.catalyst || '').trim();
    const riskNote = String(row?.risk_note || '').trim();
    const note = [catalyst, riskNote].filter(Boolean).join(' ').slice(0, 400);

    findings.set(symbol, {
      bias: Number(clamp(bias, -15, 8).toFixed(1)),
      risk,
      note: note || 'No recent news found.',
      veto,
      sentiment,
      confidence,
    });
  }

  return findings;
}