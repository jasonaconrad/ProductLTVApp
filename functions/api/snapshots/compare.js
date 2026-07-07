import { compareSnapshots } from '../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ request, env }) => {
  const url = new URL(request.url);
  const a = url.searchParams.get('a');
  const b = url.searchParams.get('b');
  if (!a || !b) return errorResponse('Query params a and b (snapshot ids) are required', 400);

  const result = await compareSnapshots(env, a, b);
  if (result.error) return errorResponse(result.error, 404);
  return json(result);
});
