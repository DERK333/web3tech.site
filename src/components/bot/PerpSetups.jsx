import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PerpSetupCard from "@/components/bot/PerpSetupCard";

export default function PerpSetups() {
  const [setups, setSetups] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await base44.functions.invoke("perpSetups", {});
      setSetups(response?.data?.setups || []);
      setMessage(response?.data?.message || "");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not build perp setups right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Entry, stop and target from the bot's last scan. Place them yourself in Atomic — nothing
          here sends an order.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-4 text-xs text-muted-foreground">Building setups from the latest scan…</p>
      ) : error ? (
        <p className="mt-4 text-xs text-red-400">{error}</p>
      ) : setups.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">{message || "No setups right now."}</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {setups.map((setup) => (
            <PerpSetupCard key={`${setup.side}-${setup.symbol}`} setup={setup} />
          ))}
        </div>
      )}
    </div>
  );
}