import React, { useState, useEffect, useCallback } from "react";
import { Search, MousePointerClick, Eye, TrendingUp, MapPin, Monitor, FileText, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { base44 } from "@/api/base44Client";
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

function RankTable({ rows, nameKey, emptyText }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">{emptyText || "No data"}</p>;
  }
  const fmtPct = (v) => `${(parseFloat(v) * 100).toFixed(1)}%`;
  const fmtPos = (v) => (parseFloat(v) ? parseFloat(v).toFixed(1) : "—");
  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.rank} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/40 transition-colors">
          <span className="w-5 text-xs text-muted-foreground tabular-nums">{r.rank}</span>
          <span className="truncate text-sm text-foreground flex-1" title={r[nameKey]}>{r[nameKey]}</span>
          <span className="text-xs font-mono text-muted-foreground tabular-nums">{r.impressions.toLocaleString()}</span>
          <span className="text-sm font-mono text-primary tabular-nums w-12 text-right">{r.clicks.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">{fmtPct(r.ctr)}</span>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{fmtPos(r.position)}</span>
        </div>
      ))}
    </div>
  );
}

export default function SearchConsoleOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteUrl, setSiteUrl] = useState(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { days };
      if (siteUrl) payload.siteUrl = siteUrl;
      const res = await base44.functions.invoke("searchConsole", payload);
      setData(res.data);
      if (!siteUrl && res.data?.selectedSiteUrl) setSiteUrl(res.data.selectedSiteUrl);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load Search Console data");
    } finally {
      setLoading(false);
    }
  }, [days, siteUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmtDate = (yyyymmdd) => {
    if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
    const d = parse(yyyymmdd, "yyyyMMdd", new Date());
    return format(d, "MMM d");
  };

  const fmtPct = (v) => {
    const n = parseFloat(v) || 0;
    return n ? `${(n * 100).toFixed(1)}%` : "—";
  };

  const fmtPos = (v) => {
    const n = parseFloat(v) || 0;
    return n ? n.toFixed(1) : "—";
  };

  const ov = data?.overview || {};
  const chartData = (data?.byDay || []).map((d) => ({ ...d, label: fmtDate(d.date) }));

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 backdrop-blur p-4 sm:p-6">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Google Search Console
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `Search performance for ${data.selectedSiteUrl} · ${data.dateRange?.start} → ${data.dateRange?.end}` : "Loading your search performance data…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data?.sites?.length > 0 && (
            <Select value={siteUrl || data.selectedSiteUrl} onValueChange={(v) => setSiteUrl(v)}>
              <SelectTrigger className="w-[220px] bg-card/60"><SelectValue placeholder="Property" /></SelectTrigger>
              <SelectContent>
                {data.sites.map((s) => (
                  <SelectItem key={s.url} value={s.url}>{s.url}</SelectItem>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border/60 bg-card/40 animate-pulse" />
          ))}
        </div>
      ) : data && (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={MousePointerClick} label="Clicks" value={(ov.clicks || 0).toLocaleString()} accent="bg-primary/10 text-primary" />
            <StatCard icon={Eye} label="Impressions" value={(ov.impressions || 0).toLocaleString()} accent="bg-accent/10 text-accent" />
            <StatCard icon={TrendingUp} label="Avg CTR" value={fmtPct(ov.ctr)} accent="bg-primary/10 text-primary" />
            <StatCard icon={Search} label="Avg Position" value={fmtPos(ov.position)} accent="bg-accent/10 text-accent" />
          </div>

          {/* Daily chart */}
          <Section title="Daily Clicks & Impressions" icon={TrendingUp} className="mb-6">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No search data in this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="imprGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="impressions" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#imprGrad)" />
                    <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#clicksGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Section>

          {/* Tables */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Section title="Top Queries" icon={Search}>
              <div className="flex items-center gap-3 px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="w-5">#</span>
                <span className="flex-1">Query</span>
                <span className="w-20 text-right">Impr.</span>
                <span className="w-12 text-right">Clicks</span>
                <span className="w-14 text-right">CTR</span>
                <span className="w-10 text-right">Pos</span>
              </div>
              <RankTable rows={data.topQueries} nameKey="query" emptyText="No query data in this period." />
            </Section>
            <Section title="Top Pages" icon={FileText}>
              <div className="flex items-center gap-3 px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="w-5">#</span>
                <span className="flex-1">Page</span>
                <span className="w-20 text-right">Impr.</span>
                <span className="w-12 text-right">Clicks</span>
                <span className="w-14 text-right">CTR</span>
                <span className="w-10 text-right">Pos</span>
              </div>
              <RankTable rows={data.topPages} nameKey="page" emptyText="No page data in this period." />
            </Section>
            <Section title="Top Countries" icon={MapPin}>
              <div className="flex items-center gap-3 px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="w-5">#</span>
                <span className="flex-1">Country</span>
                <span className="w-20 text-right">Impr.</span>
                <span className="w-12 text-right">Clicks</span>
                <span className="w-14 text-right">CTR</span>
                <span className="w-10 text-right">Pos</span>
              </div>
              <RankTable rows={data.topCountries} nameKey="country" emptyText="No country data in this period." />
            </Section>
            <Section title="Devices" icon={Monitor}>
              <div className="flex items-center gap-3 px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="w-5">#</span>
                <span className="flex-1">Device</span>
                <span className="w-20 text-right">Impr.</span>
                <span className="w-12 text-right">Clicks</span>
                <span className="w-14 text-right">CTR</span>
                <span className="w-10 text-right">Pos</span>
              </div>
              <RankTable rows={data.topDevices} nameKey="device" emptyText="No device data in this period." />
            </Section>
          </div>

          {/* Sitemaps */}
          {data.sitemaps?.length > 0 && (
            <Section title="Sitemaps" icon={FileText}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                      <th className="py-2 pr-4">Path</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Submitted</th>
                      <th className="py-2 pr-4 text-right">URLs</th>
                      <th className="py-2 pr-4 text-right">Indexed</th>
                      <th className="py-2 pr-4 text-right">Errors</th>
                      <th className="py-2 text-right">Warnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sitemaps.map((s) => (
                      <tr key={s.path} className="border-b border-border/30 last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs text-foreground truncate max-w-[200px]" title={s.path}>{s.path}</td>
                        <td className="py-2 pr-4 text-muted-foreground text-xs">{s.type || "—"}</td>
                        <td className="py-2 pr-4 text-muted-foreground text-xs">{s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString() : "—"}</td>
                        <td className="py-2 pr-4 text-right font-mono text-xs">{(s.submitted || 0).toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right font-mono text-xs text-primary">{(s.indexed || 0).toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right font-mono text-xs text-destructive">{(s.errors || 0).toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-xs text-muted-foreground">{(s.warnings || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}