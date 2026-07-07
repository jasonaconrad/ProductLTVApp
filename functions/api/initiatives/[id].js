import { getJoined, getActuals, updateInitiative, deleteInitiative } from '../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env, params }) => {
  const initiative = await getJoined(env, params.id);
  if (!initiative) return errorResponse('Initiative not found', 404);
  const actuals = await getActuals(env, params.id);
  return json({ ...initiative, actuals });
});

export const onRequestPut = withErrorHandling(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  const updated = await updateInitiative(env, params.id, body);
  if (!updated) return errorResponse('Initiative not found', 404);
  return json(updated);
});

export const onRequestDelete = withErrorHandling(async ({ env, params }) => {
  const ok = await deleteInitiative(env, params.id);
  if (!ok) return errorResponse('Initiative not found', 404);
  return json(null, 204);
});
