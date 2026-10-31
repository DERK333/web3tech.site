import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { buildDeals } from "@/lib/deals";
import TradeStats from "@/components/bot/TradeStats";
import DealTable from "@/components/bot/DealTable";

const PAGE_SIZE = 200;

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [userId, setUserId] = useState(null);

  // The deals shown are always this user's own trades.
  const loadFirst = useCallback(async () => {
    const me = await base44.auth.me();
    setUserId(me.id);
    const page = await base44.entities.BotTrade.filter(
      { owner_id: me.id },
      { sort: "-created_date", limit: PAGE_SIZE }
    );
    setTrades(page?.items || []);
    setCursor(page?.next_cursor || null);
    setHasMore(Boolean(page?.has_more));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await loadFirst();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadFirst]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await base44.entities.BotTrade.filter(
        { owner_id: userId },
        { sort: "-created_date", limit: PAGE_SIZE, cursor }
      );
      setTrades((prev) => [...prev, ...(page?.items || [])]);
      setCursor(page?.next_cursor || null);
      setHasMore(Boolean(page?.has_more));
    } finally {
      setLoadingMore(false);
    }
  };

  const deals = useMemo(() => buildDeals(trades), [trades]);
  const openDeals = useMemo(() => deals.filter((deal) => deal.status === "open"), [deals]);
  const closedDeals = useMemo(() => deals.filter((deal) => deal.status !== "open"), [deals]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/trading"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to the bot
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <History className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trade history</p>
      </div>

      <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
        Every deal the bot has made
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Each entry is paired with the exit that closed it, so you can read a deal end to end: the
        asset, the price paid on the way in, and how it finished. Open deals keep their entry price
        and fill in the outcome when they close.
      </p>

      {loading ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading the trade history…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <TradeStats deals={deals} />
          </div>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Open deals</h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                {openDeals.length} open
              </span>
            </div>
            <DealTable
              deals={openDeals}
              emptyMessage="No open deals right now — the bot is not holding a position."
            />
          </section>

          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Closed deals</h2>
              <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {closedDeals.length} finished
              </span>
            </div>
            <DealTable
              deals={closedDeals}
              emptyMessage="Nothing has closed yet. When the bot exits a position the deal moves here with its final outcome."
            />
          </section>

          {hasMore ? (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load earlier trades"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}