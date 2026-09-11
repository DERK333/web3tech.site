import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, ShieldAlert, LogIn, Wand2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import RedditDraftCard from "@/components/blog/RedditDraftCard";
import { useAuth } from "@/lib/AuthContext";

const INSIGHT_SUBS = [
  { id: "web3", label: "r/web3" },
  { id: "selfhosted", label: "r/selfhosted" },
  { id: "privacyguides", label: "r/privacyguides" },
];

const ANSWER_SUBS = [
  { id: "ethereum", label: "r/ethereum" },
  { id: "linux", label: "r/linux" },
  { id: "netsec", label: "r/netsec" },
];

export default function Reddit() {
  const { isAuthenticated, isLoadingAuth, user, navigateToLogin } = useAuth();
  const [mode, setMode] = useState("insight");
  const [subreddit, setSubreddit] = useState("web3");
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "Reddit Drafts | TheWeb3Tech";
  }, []);

  const loadDrafts = useCallback(async () => {
    try {
      const list = await base44.entities.RedditDraft.list("-created_date", 50);
      setDrafts(list || []);
    } catch {
      setDrafts([]);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    loadDrafts().finally(() => setLoading(false));
  }, [user, loadDrafts]);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
    setSubreddit(next === "insight" ? INSIGHT_SUBS[0].id : ANSWER_SUBS[0].id);
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError("");
    setNotice("");
    try {
      if (mode === "insight") {
        const res = await base44.functions.invoke("generateRedditInsightPost", { subreddit });
        setDrafts((prev) => [res.data.draft, ...prev]);
      } else {
        const res = await base44.functions.invoke("generateRedditAnswers", { subreddit, count: 2 });
        if (!res.data.drafts?.length) {
          setNotice(res.data.message || "No new questions found right now.");
        } else {
          setDrafts((prev) => [...res.data.drafts, ...prev]);
        }
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Generation failed — try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatus = async (id, status) => {
    await base44.entities.RedditDraft.update(id, { status });
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
        <h1 className="font-heading text-xl font-bold text-foreground">Sign in required</h1>
        <p className="text-sm text-muted-foreground">Sign in with an admin account to draft Reddit posts.</p>
        <Button onClick={navigateToLogin}><LogIn className="w-4 h-4" /> Sign in</Button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
        <h1 className="font-heading text-xl font-bold text-foreground">Admins only</h1>
        <p className="text-sm text-muted-foreground">This drafting tool is only available to site admins.</p>
      </div>
    );
  }

  const activeSubs = mode === "insight" ? INSIGHT_SUBS : ANSWER_SUBS;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Reddit drafts</h1>
          <p className="text-xs text-muted-foreground">AI-drafted insights and answers — review, tweak, and post by hand.</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Every draft leads with value and stands on its own. Only append the optional closing line when it
        genuinely fits — never post a bare link.
      </p>

      {/* Generator */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4 mb-8 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchMode("insight")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === "insight"
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/30"
            }`}
          >
            <Wand2 className="w-4 h-4" /> Original insight
          </button>
          <button
            onClick={() => switchMode("answer")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === "answer"
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/30"
            }`}
          >
            <MessageSquareText className="w-4 h-4" /> Answer questions
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeSubs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubreddit(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                subreddit === s.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "insight" ? <Wand2 className="w-4 h-4" /> : <MessageSquareText className="w-4 h-4" />}
          {generating ? "Drafting…" : mode === "insight" ? "Draft an original insight" : "Draft answers to new questions"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
      </div>

      {/* Draft list */}
      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          No drafts yet — generate your first one above.
        </p>
      ) : (
        <div className="space-y-4">
          {drafts.map((d) => (
            <RedditDraftCard key={d.id} draft={d} onStatus={handleStatus} />
          ))}
        </div>
      )}
    </div>
  );
}