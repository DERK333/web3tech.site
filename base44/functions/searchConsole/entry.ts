import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SC_API = 'https://www.googleapis.com/webmasters/v3';

async function scFetch(url, token, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = (json && (json.error?.message || json.raw)) || `Search Console API ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// List verified Search Console sites available to the connected account
async function listSites(token) {
  const data = await scFetch(`${SC_API}/sites`, token);
  return (data.siteEntry || [])
    .filter(s => s.permissionLevel !== 'siteUnverifiedUser')
    .map(s => ({ url: s.siteUrl, permissionLevel: s.permissionLevel }));
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    let body = {};
    try {
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const text = await req.text();
        body = text ? JSON.parse(text) : {};
      }
    } catch { body = {}; }

    const days = parseInt(String(body.days ?? '30'), 10);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    const sites = await listSites(accessToken);
    if (!sites.length) {
      return Response.json({ sites: [], error: 'No verified Search Console properties found in this account.' });
    }

    // Prefer the web3tech.site domain if present, else the first available
    const preferred = body.siteUrl || sites.find(s => s.url.includes('web3tech.site'))?.url || sites[0].url;
    const siteUrl = encodeURIComponent(preferred);

    // Date window (ISO date strings, no time)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const range = { start: fmt(start), end: fmt(end) };

    const queryBody = (dimensions) => JSON.stringify({
      startDate: range.start,
      endDate: range.end,
      dimensions,
      rowLimit: 1000,
    });

    const [overview, byDay, topQueries, topPages, topCountries, topDevices, sitemaps] = await Promise.all([
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody([]) }),
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody(['date']) }),
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody(['query']) }),
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody(['page']) }),
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody(['country']) }),
      scFetch(`${SC_API}/sites/${siteUrl}/searchAnalytics/query`, accessToken, { method: 'POST', body: queryBody(['device']) }),
      scFetch(`${SC_API}/sites/${siteUrl}/sitemaps`, accessToken).catch(() => ({ sitemap: [] })),
    ]);

    const ovRow = overview.rows?.[0] || {};
    const byDayRows = (byDay.rows || []).map(r => ({
      date: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const rank = (rows, keyName) => (rows || [])
      .slice(0, 15)
      .map((r, i) => ({
        rank: i + 1,
        [keyName]: r.keys[0],
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
      }));

    return Response.json({
      sites,
      selectedSiteUrl: preferred,
      days,
      dateRange: range,
      overview: {
        clicks: ovRow.clicks || 0,
        impressions: ovRow.impressions || 0,
        ctr: ovRow.ctr || 0,
        position: ovRow.position || 0,
      },
      byDay: byDayRows,
      topQueries: rank(topQueries.rows, 'query'),
      topPages: rank(topPages.rows, 'page'),
      topCountries: rank(topCountries.rows, 'country'),
      topDevices: rank(topDevices.rows, 'device'),
      sitemaps: (sitemaps.sitemap || []).map(s => ({
        path: s.path,
        type: s.type,
        lastSubmitted: s.lastSubmitted,
        lastDownload: s.lastDownload,
        errors: s.errors || 0,
        warnings: s.warnings || 0,
        submitted: s.submitted || 0,
        indexed: s.indexed || 0,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}