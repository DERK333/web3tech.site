import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { buildDeals } from "@/lib/deals";
import TradeStats from "@/components/bot/TradeStats";
import DealTable from "@/components/bot/DealTable";

const PAGE_SIZE = 200;
const FILTERS = [
  { key: "all", label: "All deals" },
  { key: "closed", label: "Closed" },
  { key: "open", label: "Open" },
];

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadFirst = useCallback(async () => {
    const page = await base44.entities.BotTrade.filter(
      {},
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
        {},
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
  const visible = useMemo(
    () =>
      filter === "all"
        ? deals
        : deals.filter((deal) => (filter === "open" ? deal.status === "open" : deal.status !== "open")),
    [deals, filter]
  );

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

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === option.key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {visible.length} deal{visible.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3">
            <DealTable deals={visible} />
          </div>

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