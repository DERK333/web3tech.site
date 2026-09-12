import React, { useState, useRef } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HoneypotField from "@/components/blog/HoneypotField";
import TurnstileWidget from "@/components/blog/TurnstileWidget";
import { motion } from "framer-motion";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await base44.functions.invoke("sendSubscriptionConfirmation", { kind: "newsletter", email: email.trim(), company_website: companyWebsite, turnstile_token: turnstileToken });
      if (res.data?.already_subscribed) {
        turnstileRef.current?.reset();
        setStatus("error");
        setErrorMsg("This email is already subscribed!");
        return;
      }
      base44.analytics.track({ eventName: "newsletter_subscribed" });
      setStatus("success");
    } catch (err) {
      turnstileRef.current?.reset();
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Mail className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-sm text-foreground">Newsletter</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Get notified whenever a new article drops — Web3, crypto, Linux, and more.
      </p>

      {status === "success" ? (
        <div className="flex items-start gap-2 text-primary text-sm py-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Almost there! Check your inbox — click the confirmation link to finish subscribing.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <HoneypotField value={companyWebsite} onChange={setCompanyWebsite} />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
          {errorMsg && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || !turnstileToken}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}