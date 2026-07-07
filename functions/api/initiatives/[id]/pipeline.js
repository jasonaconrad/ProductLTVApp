import { updatePipeline } from '../../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../../_shared/http.js';

export const onRequestPut = withErrorHandling(async ({ request, env, params }) => {
  const body = await request.json().catch(() => ({}));
  const updated = await updatePipeline(env, params.id, body);
  if (!updated) return errorResponse('Initiative not found', 404);
  return json(updated);
});
