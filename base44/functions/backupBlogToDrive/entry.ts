import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

const FOLDER_NAME = 'Web3Tech Blog Backup';

function buildPostMarkdown(post, includeBody) {
  const tags = (post.tags || []).map((t) => `"${String(t).replace(/"/g, '\\"')}"`).join(', ');
  const safe = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let md = `---
title: "${safe(post.title)}"
slug: "${safe(post.slug)}"
date: "${safe(post.date)}"
author: "${safe(post.author)}"
category: "${safe(post.category)}"
image: "${safe(post.image)}"
tags: [${tags}]
---

# ${post.title || ''}

**Excerpt:** ${post.excerpt || ''}

> Read online: https://web3tech.site/blog/${post.slug}
`;
  if (includeBody && post.content) {
    md += `\n---\n\n${post.content}\n`;
  } else {
    md +=
      '\n---\n\n*Metadata-only record. Article body was not available to this ' +
      'scheduled run; it is refreshed from the site on the next full-content sync.*\n';
  }
  return md;
}

function buildMultipart(metadata, content) {
  const boundary = 'b44boundary' + Math.random().toString(36).slice(2);
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) + '\r\n' +
    `--${boundary}\r\n` +
    `Content-Type: text/markdown\r\n\r\n` +
    content + '\r\n' +
    `--${boundary}--`;
  return { body, contentType: `multipart/related; boundary=${boundary}` };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Allow the scheduled workflow (no user session) and manual admin runs;
    // block everyone else from invoking the endpoint directly.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // The site can pass the full posts array (including article bodies) for a
    // full-content backup. The scheduled workflow calls with no body, falling
    // back to the shared metadata-only catalog.
    let payloadPosts = null;
    try {
      const body = await req.json();
      if (body && Array.isArray(body.posts) && body.posts.length > 0) {
        payloadPosts = body.posts;
      }
    } catch {}

    const posts = payloadPosts || POSTS;
    const includeBody = !!payloadPosts;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const auth = { Authorization: `Bearer ${accessToken}` };

    // Find or create the backup folder.
    const findFolderRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      )}&fields=files(id)`,
      { headers: auth }
    );
    const folderJson = await findFolderRes.json();
    let folderId = folderJson.files && folderJson.files[0] ? folderJson.files[0].id : null;

    if (!folderId) {
      const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
      });
      const fd = await createFolderRes.json();
      folderId = fd.id;
    }

    // List existing backup files so we update instead of duplicating.
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `'${folderId}' in parents and trashed=false`
      )}&fields=files(id,name)`,
      { headers: auth }
    );
    const listJson = await listRes.json();
    const existing = {};
    for (const f of listJson.files || []) {
      existing[f.name] = f.id;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const post of posts) {
      const fileName = `${post.slug}.md`;
      const content = buildPostMarkdown(post, includeBody);

      try {
        if (existing[fileName]) {
          // Scheduled metadata-only runs must not overwrite a full-content
          // file already written from the site — skip and leave it intact.
          if (!includeBody) {
            skipped++;
            continue;
          }
          const { body, contentType } = buildMultipart({ name: fileName }, content);
          const res = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${existing[fileName]}?uploadType=multipart&fields=id`,
            { method: 'PATCH', headers: { ...auth, 'Content-Type': contentType }, body }
          );
          if (res.ok) updated++;
          else errors.push({ slug: post.slug, status: res.status, op: 'update' });
        } else {
          const { body, contentType } = buildMultipart(
            { name: fileName, mimeType: 'text/markdown', parents: [folderId] },
            content
          );
          const res = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
            { method: 'POST', headers: { ...auth, 'Content-Type': contentType }, body }
          );
          if (res.ok) created++;
          else errors.push({ slug: post.slug, status: res.status, op: 'create' });
        }
      } catch (e) {
        errors.push({ slug: post.slug, error: e.message });
      }
    }

    return Response.json({
      status: 'ok',
      folder: folderId,
      posts: posts.length,
      created,
      updated,
      skipped,
      mode: includeBody ? 'full' : 'metadata',
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}