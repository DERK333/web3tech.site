import React, { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Full-width newsletter signup band used on the share landing pages.
export default function ShareSignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    const existing = await base44.entities.Subscriber.filter({ email: email.trim() });
    if (existing.length > 0) {
      setStatus("error");
      setErrorMsg("This email is already subscribed!");
      return;
    }

    await base44.entities.Subscriber.create({ email: email.trim() });
    base44.analytics.track({ eventName: "newsletter_subscribed" });
    setStatus("success");
  };

  return (
    <div className="w-full bg-gradient-to-br from-primary/10 via-secondary/60 to-background border-y border-border/60 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
          <Mail className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Free newsletter</span>
        </div>
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground mb-2">
          Enjoying this article?
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
          Get the next one straight to your inbox — practical guides on Web3, crypto, Linux, security, and privacy. No spam, unsubscribe anytime.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>You're subscribed! 🎉</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-lg bg-secondary border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
        {errorMsg && (
          <p className="text-xs text-destructive mt-3">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}