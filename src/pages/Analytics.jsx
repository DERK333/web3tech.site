import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Users, MousePointerClick, Clock, Activity, Globe, Link2, FileText, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading font-bold text-foreground leading-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, icon: Icon, children, className }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4 sm:p-5 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-heading font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RankTable({ rows, columns, emptyText }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">{emptyText || "No data"}</p>;
  }
  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.rank} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/40 transition-colors">
          <span className="w-5 text-xs text-muted-foreground tabular-nums">{r.rank}</span>
          {columns.map((c) => (
            <span key={c.key} className={`truncate ${c.key === "rank" ? "" : ""} ${c.mono ? "font-mono text-xs" : ""} ${c.right ? "ml-auto text-muted-foreground" : "text-foreground"}`} style={c.maxWidth ? { maxWidth: c.maxWidth } : undefined}>
              {c.render ? c.render(r) : r[c.key]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { days };
      if (propertyId) payload.propertyId = propertyId;
      const res = await base44.functions.invoke("analytics", payload);
      setData(res.data);
      if (!propertyId && res.data?.selectedPropertyId) setPropertyId(res.data.selectedPropertyId);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, propertyId]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, isAuthenticated]);

  const fmtDate = (yyyymmdd) => {
    if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
    const d = parse(yyyymmdd, "yyyyMMdd", new Date());
    return format(d, "MMM d");
  };

  const fmtDur = (s) => {
    const n = parseFloat(s) || 0;
    if (!n) return "—";
    const m = Math.floor(n / 60);
    const sec = Math.round(n % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const fmtPct = (v) => {
    const n = parseFloat(v) || 0;
    return n ? `${(n * 100).toFixed(1)}%` : "—";
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">Sign in required</h2>
        <p className="text-muted-foreground">You must be signed in as an admin to view analytics.</p>
      </div>
    );
  }

  const ov = data?.overview || {};
  const chartData = (data?.byDay || []).map((d) => ({ ...d, label: fmtDate(d.date) }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.properties.length} properties · ${data.dateRange?.start} → ${data.dateRange?.end}` : "Loading your Google Analytics data…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data?.properties?.length > 0 && (
            <Select value={propertyId || data.selectedPropertyId} onValueChange={(v) => { setPropertyId(v); }}>
              <SelectTrigger className="w-[220px] bg-card/60"><SelectValue placeholder="Property" /></SelectTrigger>
              <SelectContent>
                {data.properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.displayName} <span className="text-muted-foreground">· {p.account}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v, 10))}>
            <SelectTrigger className="w-[120px] bg-card/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg border border-border/50 bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-4 mb-6 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-2" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border/60 bg-card/40 animate-pulse" />
          ))}
        </div>
      ) : data && (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <StatCard icon={Activity} label="Sessions" value={ov.sessions ?? 0} accent="bg-primary/10 text-primary" />
            <StatCard icon={Users} label="Users" value={ov.users ?? 0} accent="bg-accent/10 text-accent" />
            <StatCard icon={MousePointerClick} label="Page Views" value={ov.pageviews ?? 0} accent="bg-primary/10 text-primary" />
            <StatCard icon={Clock} label="Engagement" value={fmtPct(ov.engagementRate)} accent="bg-accent/10 text-accent" />
            <StatCard icon={Clock} label="Avg Session" value={fmtDur(ov.avgSessionDuration)} accent="bg-primary/10 text-primary" />
          </div>

          {/* Daily chart */}
          <Section title="Daily Sessions" icon={Activity} className="mb-6">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No sessions in this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#sessGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Section>

          {/* Tables */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Section title="Top Pages" icon={FileText}>
              <RankTable
                rows={data.topPages}
                columns={[
                  { key: "rank" },
                  { key: "pageTitle", maxWidth: "100%", render: (r) => <span className="truncate text-sm text-foreground">{r.pageTitle || r.pagePath}</span> },
                  { key: "screenPageViews", right: true, render: (r) => <span className="text-sm font-mono text-primary">{r.screenPageViews}</span> },
                ]}
                emptyText="No page views in this period."
              />
            </Section>
            <Section title="Top Sources" icon={Link2}>
              <RankTable
                rows={data.topSources}
                columns={[
                  { key: "rank" },
                  { key: "source", maxWidth: "100%", render: (r) => (
                    <span className="truncate text-sm text-foreground">
                      {r.source || r.channel}
                      {r.channel && r.source ? <span className="text-muted-foreground text-xs"> · {r.channel}</span> : null}
                    </span>
                  ) },
                  { key: "sessions", right: true, render: (r) => <span className="text-sm font-mono text-primary">{r.sessions}</span> },
                ]}
                emptyText="No traffic sources in this period."
              />
            </Section>
            <Section title="Top Countries" icon={Globe}>
              <RankTable
                rows={data.topCountries}
                columns={[
                  { key: "rank" },
                  { key: "country", maxWidth: "100%", render: (r) => <span className="truncate text-sm text-foreground">{r.country || "(unknown)"}</span> },
                  { key: "sessions", right: true, render: (r) => <span className="text-sm font-mono text-primary">{r.sessions}</span> },
                ]}
                emptyText="No country data in this period."
              />
            </Section>
          </div>
        </>
      )}
    </div>
  );
}