import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2, Bell, ShieldCheck, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const existing = await base44.entities.Subscriber.filter({ email: email.trim() });
      if (existing.length > 0) {
        setStatus("error");
        setErrorMsg("This email is already subscribed!");
        return;
      }
      await base44.entities.Subscriber.create({ email: email.trim() });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Subscribe to the Newsletter</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get notified whenever a new article drops. Web3, crypto, Linux, and cybersecurity insights — straight to your inbox. No spam, ever.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl mb-2">You're subscribed! 🎉</h2>
            <p className="text-sm text-muted-foreground">
              Watch your inbox for the next article. You can unsubscribe at any time.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
              {[
                { icon: Zap, title: "Instant alerts", desc: "Notified on every new post" },
                { icon: ShieldCheck, title: "No spam", desc: "We never sell your email" },
                { icon: Bell, title: "Unsubscribe anytime", desc: "One click to opt out" },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <f.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="font-heading font-semibold text-xs text-foreground">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}