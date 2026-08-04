import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';

async function gaFetch(url, token, init = {}) {
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
    const msg = (json && (json.error?.message || json.raw)) || `GA API ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// List GA4 properties available to the connected account
async function listProperties(token) {
  const data = await gaFetch(`${ADMIN_API}/accountSummaries`, token);
  const properties = [];
  for (const acc of data.accountSummaries || []) {
    for (const prop of acc.propertySummaries || []) {
      const id = (prop.property || '').split('/').pop();
      if (id) properties.push({ id, displayName: prop.displayName || id, account: acc.displayName || '' });
    }
  }
  return properties;
}

// Run a report on a property
function runReport(propertyId, token, dateRange, dimensions, metrics) {
  const body = JSON.stringify({
    dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
    dimensions: dimensions.map(d => ({ name: d })),
    metrics: metrics.map(m => ({ name: m })),
  });
  return gaFetch(`${DATA_API}/properties/${propertyId}:runReport`, token, { method: 'POST', body });
}

function rowToObj(row) {
  const out = {};
  (row.dimensionValues || []).forEach((v, i) => { out[`d${i}`] = v.value; });
  (row.metricValues || []).forEach((v, i) => { out[`m${i}`] = v.value; });
  return out;
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
    const url = new URL(req.url);
    const qp = Object.fromEntries(url.searchParams.entries());
    const propertyId = body.propertyId || qp.propertyId;
    const days = parseInt(String(body.days ?? qp.days ?? '30'), 10);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

    // Always return the list of available properties
    const properties = await listProperties(accessToken);
    if (!properties.length) {
      return Response.json({ properties: [], error: 'No GA4 properties found in this Google Analytics account.' });
    }

    const targetId = propertyId || properties[0].id;

    // Build date window (ISO date strings, no time)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const range = { start: fmt(start), end: fmt(end) };

    const [overview, byDay, topPages, topSources, topCountries] = await Promise.all([
      runReport(targetId, accessToken, range, [], ['sessions', 'totalUsers', 'screenPageViews', 'engagementRate', 'averageSessionDuration']),
      runReport(targetId, accessToken, range, ['date'], ['sessions', 'totalUsers']),
      runReport(targetId, accessToken, range, ['pagePath', 'pageTitle'], ['screenPageViews']),
      runReport(targetId, accessToken, range, ['sessionDefaultChannelGroup', 'sessionSource'], ['sessions']),
      runReport(targetId, accessToken, range, ['country'], ['sessions']),
    ]);

    const pick = (report, dims, metrics) =>
      (report.rows || []).slice(0, 15).map((r, ri) => {
        const o = rowToObj(r);
        const out = { rank: ri + 1 };
        dims.forEach((d, i) => { out[d] = o[`d${i}`]; });
        metrics.forEach((m, i) => { out[m] = o[`m${i}`]; });
        return out;
      });

    const ov = overview.totals?.[0]?.metricValues || [];
    const ovVal = (i) => (ov[i]?.value !== undefined ? ov[i].value : null);

    const byDayRows = (byDay.rows || []).map(r => {
      const o = rowToObj(r);
      return { date: o.d0, sessions: parseInt(o.m0, 10) || 0, users: parseInt(o.m1, 10) || 0 };
    }).sort((a, b) => a.date.localeCompare(b.date));

    const pageRows = (topPages.rows || []).map(r => parseInt(rowToObj(r).m0, 10) || 0);

    const sumSessions = byDayRows.reduce((a, b) => a + b.sessions, 0);
    const sumUsers = byDayRows.reduce((a, b) => a + b.users, 0);
    const sumPageviews = pageRows.reduce((a, b) => a + b, 0);

    return Response.json({
      properties,
      selectedPropertyId: targetId,
      days,
      dateRange: range,
      overview: {
        sessions: ovVal(0) !== null ? parseInt(ovVal(0), 10) : sumSessions,
        users: ovVal(1) !== null ? parseInt(ovVal(1), 10) : sumUsers,
        pageviews: ovVal(2) !== null ? parseInt(ovVal(2), 10) : sumPageviews,
        engagementRate: ovVal(3) !== null ? parseFloat(ovVal(3)) : 0,
        avgSessionDuration: ovVal(4) !== null ? parseFloat(ovVal(4)) : 0,
      },
      byDay: byDayRows,
      topPages: pick(topPages, ['pagePath', 'pageTitle'], ['screenPageViews']),
      topSources: pick(topSources, ['channel', 'source'], ['sessions']),
      topCountries: pick(topCountries, ['country'], ['sessions']),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}