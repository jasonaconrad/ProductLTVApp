import { listSnapshotsMeta, takeSnapshot } from '../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env }) => {
  return json(await listSnapshotsMeta(env));
});

export const onRequestPost = withErrorHandling(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.label) return errorResponse('label is required', 400);

  const snapshotId = crypto.randomUUID();
  const meta = await takeSnapshot(env, snapshotId, body.label, body.created_by);
  return json(meta, 201);
});
