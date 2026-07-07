import { getSnapshotRows, deleteSnapshot } from '../../_shared/db.js';
import { json, errorResponse, withErrorHandling } from '../../_shared/http.js';

export const onRequestGet = withErrorHandling(async ({ env, params }) => {
  const rows = await getSnapshotRows(env, params.snapshotId);
  if (rows.length === 0) return errorResponse('Snapshot not found', 404);
  return json(rows);
});

export const onRequestDelete = withErrorHandling(async ({ env, params }) => {
  const ok = await deleteSnapshot(env, params.snapshotId);
  if (!ok) return errorResponse('Snapshot not found', 404);
  return json(null, 204);
});
