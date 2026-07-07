import { json, errorResponse } from './_shared/http.js';
import {
  listInitiatives, getJoined, createInitiative, updateInitiative, deleteInitiative,
  cloneInitiative, getActuals, upsertActual, updatePipeline,
  listSnapshotsMeta, takeSnapshot, getSnapshotRows, deleteSnapshot, compareSnapshots,
  getFlags,
} from './_shared/db.js';

async function handleApi(request, env, pathname) {
  const method = request.method;

  if (pathname === '/api/initiatives') {
    if (method === 'GET') return json(await listInitiatives(env));
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body.name || !body.platform || !body.fy) return errorResponse('name, platform, and fy are required', 400);
      const id = await createInitiative(env, body);
      return json(await getJoined(env, id), 201);
    }
  }

  let match = pathname.match(/^\/api\/initiatives\/(\d+)$/);
  if (match) {
    const id = match[1];
    if (method === 'GET') {
      const initiative = await getJoined(env, id);
      if (!initiative) return errorResponse('Initiative not found', 404);
      return json({ ...initiative, actuals: await getActuals(env, id) });
    }
    if (method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      const updated = await updateInitiative(env, id, body);
      if (!updated) return errorResponse('Initiative not found', 404);
      return json(updated);
    }
    if (method === 'DELETE') {
      const ok = await deleteInitiative(env, id);
      if (!ok) return errorResponse('Initiative not found', 404);
      return json(null, 204);
    }
  }

  match = pathname.match(/^\/api\/initiatives\/(\d+)\/pipeline$/);
  if (match && method === 'PUT') {
    const body = await request.json().catch(() => ({}));
    const updated = await updatePipeline(env, match[1], body);
    if (!updated) return errorResponse('Initiative not found', 404);
    return json(updated);
  }

  match = pathname.match(/^\/api\/initiatives\/(\d+)\/actuals$/);
  if (match) {
    const id = match[1];
    if (method === 'GET') return json(await getActuals(env, id));
    if (method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      if (!body.period) return errorResponse('period is required', 400);
      const rows = await upsertActual(env, id, body);
      if (!rows) return errorResponse('Initiative not found', 404);
      return json(rows);
    }
  }

  match = pathname.match(/^\/api\/initiatives\/(\d+)\/clone$/);
  if (match && method === 'POST') {
    const newId = await cloneInitiative(env, match[1]);
    if (!newId) return errorResponse('Initiative not found', 404);
    return json(await getJoined(env, newId), 201);
  }

  if (pathname === '/api/snapshots') {
    if (method === 'GET') return json(await listSnapshotsMeta(env));
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body.label) return errorResponse('label is required', 400);
      const snapshotId = crypto.randomUUID();
      return json(await takeSnapshot(env, snapshotId, body.label, body.created_by), 201);
    }
  }

  if (pathname === '/api/snapshots/compare' && method === 'GET') {
    const url = new URL(request.url);
    const a = url.searchParams.get('a');
    const b = url.searchParams.get('b');
    if (!a || !b) return errorResponse('Query params a and b (snapshot ids) are required', 400);
    const result = await compareSnapshots(env, a, b);
    if (result.error) return errorResponse(result.error, 404);
    return json(result);
  }

  match = pathname.match(/^\/api\/snapshots\/([^/]+)$/);
  if (match) {
    const snapshotId = match[1];
    if (method === 'GET') {
      const rows = await getSnapshotRows(env, snapshotId);
      if (rows.length === 0) return errorResponse('Snapshot not found', 404);
      return json(rows);
    }
    if (method === 'DELETE') {
      const ok = await deleteSnapshot(env, snapshotId);
      if (!ok) return errorResponse('Snapshot not found', 404);
      return json(null, 204);
    }
  }

  if (pathname === '/api/flags' && method === 'GET') {
    return json(await getFlags(env));
  }

  return errorResponse('Not found', 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url.pathname);
      } catch (err) {
        return errorResponse(err.message || 'Internal server error', 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
