import React, { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// One broker's key entry. Keys travel to the server, are sealed there, and are
// never sent back — this screen only ever sees the masked hint.
function KeyForm({ broker, label, status, onSaved }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const configured = status?.own_key === true;
  const usingSiteKeys = status?.app_key === true;
  const checking = status == null;

  const send = async (payload) => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("brokerKeys", payload);
      await onSaved();
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Could not save those keys.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError("Enter both the API key and the API secret.");
      return;
    }
    const ok = await send({ action: "save", broker, apiKey, apiSecret });
    if (ok) {
      setApiKey("");
      setApiSecret("");
      setOpen(false);
    }
  };

  const remove = async () => {
    const ok = await send({ action: "clear", broker });
    if (ok) setOpen(false);
  };

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">
            {checking
              ? "Checking your connection…"
              : configured
                ? `Your key ${status?.hint || "is saved"}`
              : usingSiteKeys
                ? "Using the site's own keys"
                : "No key connected"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {configured ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              aria-label={`Remove ${label} key`}
              className="p-1 text-muted-foreground transition-colors hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            disabled={busy}
          >
            <KeyRound className="mr-1 h-3.5 w-3.5" />
            {configured ? "Replace" : "Connect"}
          </Button>
        </div>
      </div>

      {open ? (
        <form onSubmit={save} className="mt-2 space-y-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
          <div>
            <Label htmlFor={`${broker}_key`} className="text-[11px] uppercase tracking-wide text-muted-foreground">
              API key
            </Label>
            <Input
              id={`${broker}_key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste your API key"
              className="mt-1 h-9 bg-background font-mono text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`${broker}_secret`} className="text-[11px] uppercase tracking-wide text-muted-foreground">
              API secret
            </Label>
            <Input
              id={`${broker}_secret`}
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="new-password"
              placeholder="Paste your API secret"
              className="mt-1 h-9 bg-background font-mono text-xs"
            />
          </div>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy} className="flex-1">
              {busy ? "Saving…" : "Save key"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Only trading permissions are needed — never enable withdrawals on a key you paste here.
          </p>
        </form>
      ) : null}
    </div>
  );
}

export default function BrokerKeysForm({ status, onSaved }) {
  return (
    <div className="mb-3 rounded-lg border border-border/60 bg-secondary/20 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Your broker accounts
      </p>
      <div className="mt-1 divide-y divide-border/60">
        <KeyForm broker="kraken" label="Kraken" status={status?.kraken} onSaved={onSaved} />
        <KeyForm broker="alpaca" label="Alpaca" status={status?.alpaca} onSaved={onSaved} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Your keys are encrypted and used only for your own orders. No other user — and no one
        else's bot — can read them or trade with them.
      </p>
    </div>
  );
}