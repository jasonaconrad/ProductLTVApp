import { listInitiatives, createInitiative, getJoined } from '../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env }) => {
  const rows = await listInitiatives(env);
  return json(rows);
});

export const onRequestPost = withErrorHandling(async ({ request, env }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.platform || !body.fy) {
    return errorResponse('name, platform, and fy are required', 400);
  }

  const id = await createInitiative(env, body);
  return json(await getJoined(env, id), 201);
});
