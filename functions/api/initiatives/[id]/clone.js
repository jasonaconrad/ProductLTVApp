import { cloneInitiative, getJoined } from '../../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../../_shared/http.js';

export const onRequestPost = withErrorHandling(async ({ env, params }) => {
  const newId = await cloneInitiative(env, params.id);
  if (!newId) return errorResponse('Initiative not found', 404);
  return json(await getJoined(env, newId), 201);
});
