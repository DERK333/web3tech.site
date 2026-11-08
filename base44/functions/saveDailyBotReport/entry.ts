import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildBotReport } from '../../shared/botReport.ts';

// Writes the bot's daily performance report into the owner's Google Drive as a
// markdown document, so it lands on their computer through Drive's own sync.
//
// Called by the "Daily Bot Report" workflow (runs as an app admin) and can also
// be run by an admin by hand. Admin-only: it reads another record set through
// the service role.

const FOLDER_NAME = 'Market Bot Reports';
const MAX_SIGNALS = 200;

function buildMultipart(metadata, content) {
  const boundary = 'b44boundary' + Math.random().toString(36).slice(2);
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    '\r\n' +
    `--${boundary}\r\n` +
    `Content-Type: text/markdown; charset=UTF-8\r\n\r\n` +
    content +
    '\r\n' +
    `--${boundary}--`;
  return { body, contentType: `multipart/related; boundary=${boundary}` };
}

async function getFolderId(auth) {
  const findRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id)`,
    { headers: auth, signal: AbortSignal.timeout(15000) }
  );
  const found = await findRes.json();
  if (found.files && found.files[0]) return found.files[0].id;

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
    signal: AbortSignal.timeout(15000),
  });
  const created = await createRes.json();
  if (!created.id) throw new Error(`Google Drive: could not create the report folder (${JSON.stringify(created)})`);
  return created.id;
}

// One file per day: a second run on the same day replaces that day's report.
async function saveReport(auth, folderId, fileName, content) {
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `'${folderId}' in parents and name='${fileName}' and trashed=false`
    )}&fields=files(id)`,
    { headers: auth, signal: AbortSignal.timeout(15000) }
  );
  const list = await listRes.json();
  const existingId = list.files && list.files[0] ? list.files[0].id : null;
  const { body, contentType } = buildMultipart(
    existingId ? { name: fileName } : { name: fileName, mimeType: 'text/markdown', parents: [folderId] },
    content
  );

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

  const res = await fetch(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: { ...auth, 'Content-Type': contentType },
    body,
    signal: AbortSignal.timeout(30000),
  });
  const saved = await res.json();
  if (!res.ok) throw new Error(`Google Drive: upload failed (HTTP ${res.status}) ${JSON.stringify(saved)}`);
  return { id: saved.id, name: saved.name, link: saved.webViewLink, replaced: !!existingId };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;
    const ownerId = user.id;
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [configPage, runsPage, tradesPage, positions, signals] = await Promise.all([
      sr.entities.BotConfig.filter({ owner_id: ownerId }, { sort: '-created_date', limit: 1 }),
      sr.entities.BotRun.filter({ owner_id: ownerId, started_at: { $gte: since } }, { sort: '-started_at', limit: 100 }),
      sr.entities.BotTrade.filter({ owner_id: ownerId, created_date: { $gte: since } }, { sort: '-created_date', limit: 200 }),
      sr.entities.BotPosition.filter({ owner_id: ownerId }),
      sr.entities.BotSignal.list('-scanned_at', MAX_SIGNALS),
    ]);

    const config = configPage?.items?.[0] || null;
    const runs = runsPage?.items || [];
    const trades = tradesPage?.items || [];
    const report = buildBotReport({
      user,
      config,
      runs,
      trades,
      positions: positions || [],
      signals: signals || [],
      generatedAt: now.toISOString(),
    });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const auth = { Authorization: `Bearer ${accessToken}` };
    const folderId = await getFolderId(auth);

    const dayKey = now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const fileName = `market-bot-report-${dayKey}.md`;
    const saved = await saveReport(auth, folderId, fileName, report);

    return Response.json({
      status: 'ok',
      date: dayKey,
      file: saved.name,
      folder: FOLDER_NAME,
      link: saved.link,
      replaced_todays_file: saved.replaced,
      days_trades: trades.length,
      open_positions: (positions || []).length,
      characters: report.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}