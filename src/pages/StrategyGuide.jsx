import React from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, Gauge, Radar, Ruler, ShieldAlert, Target } from "lucide-react";
import GuideBlock from "@/components/strategy/GuideBlock";
import ScoreAnatomy from "@/components/strategy/ScoreAnatomy";
import PerpRules from "@/components/strategy/PerpRules";

export default function StrategyGuide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Strategy</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
        How the bot decides
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Every flag on this site comes from arithmetic on daily closes: moving averages, momentum,
        RSI and realized volatility. Nothing here predicts the future — it ranks how well something
        is trending right now and how stretched that move has become.
      </p>

      <GuideBlock number="01" title="What gets scanned" icon={Radar}>
        <p>
          Every 30 minutes the scan covers your watchlist, a core list of liquid names, and then the
          next slice of everything tradable on Kraken and Alpaca, resuming where the last scan
          stopped. Over a few hours that is the whole market, not a shortlist.
        </p>
        <p>
          A series with a one-day jump over 65% is treated as a split or dividend the free data does
          not adjust for. It scores zero and is never traded — a phantom −90% is not momentum.
        </p>
      </GuideBlock>

      <GuideBlock number="02" title="How an asset is scored" icon={Gauge}>
        <ScoreAnatomy />
      </GuideBlock>

      <GuideBlock number="03" title="From score to action" icon={Activity}>
        <p>
          A score of 72 or more with price above the 200-day average is a strong buy; 62 and up is a
          buy; 45–61 holds; 34–44 trims; below that is avoid. An RSI above 80 overrides the lot —
          outstanding trend or not, the bot will not buy a blow-off top.
        </p>
        <p>
          Each signal also carries an estimated ten-session gain: recent pace, halved, then damped
          further when the 20- and 60-day trends disagree or the chart is already stretched. Risk is
          realized volatility scaled to ten sessions. Both are estimates, not forecasts.
        </p>
      </GuideBlock>

      <GuideBlock number="04" title="Which perp setups get flagged" icon={Target}>
        <PerpRules />
      </GuideBlock>

      <GuideBlock number="05" title="Where the levels come from" icon={Ruler}>
        <p>
          The stop sits as far away as that asset normally swings — its estimated ten-session risk,
          held between 2.5% and 14%. The target is the stop distance multiplied by the reward-to-risk
          the signal earned, kept between 4% and 55%. Entry is the last daily close the scan used.
        </p>
        <p>
          Leverage is capped so a full stop costs roughly 18% of the margin you post, never the whole
          position. The margin cost is printed on every setup and every alert.
        </p>
      </GuideBlock>

      <GuideBlock number="06" title="What the bot will not do" icon={ShieldAlert}>
        <p>
          It places no perp order and holds no wallet key. Atomic exposes no trading API, so these
          are suggestions you place by hand. Nothing here is investment advice, and no set of rules
          can guarantee a profit or avoid a loss.
        </p>
      </GuideBlock>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/trading"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Open the market bot <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/market-insights"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/40"
        >
          Market insights
        </Link>
      </div>
    </div>
  );
}