import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Send, Plus, MessageSquare, Loader2, Sparkles, LogIn } from "lucide-react";
import MessageBubble from "@/components/agent/MessageBubble";
import { useAuth } from "@/lib/AuthContext";

const AGENT_NAME = "insights_assistant";

export default function Assistant() {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let done = false;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (!done) {
          setConversations(list);
          if (list.length > 0) setActiveId(list[0].id);
        }
      } catch { /* ignore */ } finally {
        if (!done) setLoading(false);
      }
    })();
    return () => { done = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    base44.agents.getConversation(activeId).then((c) => {
      if (!cancelled) setMessages(c.messages || []);
    });
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      if (!cancelled) setMessages(data.messages || []);
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    const convo = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: "New conversation" },
    });
    setConversations([convo, ...conversations]);
    setActiveId(convo.id);
    setMessages([]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      let convoId = activeId;
      if (!convoId) {
        const convo = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: text.slice(0, 40) },
        });
        convoId = convo.id;
        setConversations([convo, ...conversations]);
        setActiveId(convo.id);
      }
      const convo = await base44.agents.getConversation(convoId);
      await base44.agents.addMessage(convo, { role: "user", content: text });
      inputRef.current?.focus();
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Insights Assistant</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sign in to chat with the assistant — ask about blog topics, manage your comments, or subscribe to the newsletter.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin("/assistant")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign in to continue
        </button>
      </div>
    );
  }

  const busy = messages.some((m) => m.role === "assistant" && m.tool_calls?.some((tc) => ["pending", "running", "in_progress"].includes(tc.status)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">Insights Assistant</h1>
          <p className="text-xs text-muted-foreground">Ask about Web3, crypto, Linux & security — or manage your comments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 h-[calc(100vh-13rem)] min-h-[420px]">
        {/* Conversation list */}
        <div className="hidden md:flex flex-col border border-border/50 rounded-xl bg-card/50 overflow-hidden">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-2 px-3 py-3 text-sm font-medium border-b border-border/50 hover:bg-secondary/60 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
            New chat
          </button>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${c.id === activeId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.metadata?.name || "Conversation"}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-col border border-border/50 rounded-xl bg-card/50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Sparkles className="w-8 h-8 text-primary/60 mb-3" />
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me anything about Web3, crypto, Linux, or cybersecurity. I can also help you post or edit comments on blog posts, and subscribe you to the newsletter.
                </p>
              </div>
            ) : (
              messages.map((m, i) => <MessageBubble key={i} message={m} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border/50 p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                rows={1}
                placeholder="Ask the assistant…"
                className="flex-1 resize-none max-h-32 px-3 py-2 text-sm rounded-lg bg-secondary border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending || busy}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                aria-label="Send"
              >
                {sending || busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}