import { getActuals, upsertActual } from '../../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env, params }) => {
  return json(await getActuals(env, params.id));
});

export const onRequestPut = withErrorHandling(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.period) return errorResponse('period is required', 400);

  const rows = await upsertActual(env, params.id, body);
  if (!rows) return errorResponse('Initiative not found', 404);
  return json(rows);
});
