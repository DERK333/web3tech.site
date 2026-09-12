import React, { useState } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import HoneypotField from "@/components/blog/HoneypotField";

export default function NotifyUpdateButton({ postSlug }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [error, setError] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("sendSubscriptionConfirmation", {
        kind: "post_update",
        post_slug: postSlug,
        email: email.trim(),
        company_website: companyWebsite,
      });
      setDoneMsg(
        res.data?.already_subscribed
          ? `You're already set to receive update notifications at ${email.trim()}.`
          : `We sent a confirmation link to ${email.trim()} — click it to activate update notifications.`
      );
      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) {
      // Reset for next open, keep it feeling snappy
      setTimeout(() => {
        setDone(false);
        setDoneMsg("");
        setError("");
      }, 200);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/40 rounded-full px-3 py-1.5 transition-colors"
      >
        <Bell className="w-3.5 h-3.5" />
        Get notified when this guide is updated
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-sm">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
              <DialogHeader className="space-y-1.5">
                <DialogTitle>Almost there</DialogTitle>
                <DialogDescription>{doneMsg}</DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <HoneypotField value={companyWebsite} onChange={setCompanyWebsite} />
              <DialogHeader className="mb-4">
                <DialogTitle>Get update notifications</DialogTitle>
                <DialogDescription>
                  We'll send you one email when this guide is updated — nothing else.
                </DialogDescription>
              </DialogHeader>
              <label htmlFor="notify-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <Input
                id="notify-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Signing you up..." : "Notify me"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}