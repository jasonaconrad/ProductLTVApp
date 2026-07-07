import { getFlags } from '../_shared/db.js';
import { json, withErrorHandling } from '../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env }) => {
  return json(await getFlags(env));
});
