const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listInitiatives: () => request('/initiatives'),
  getInitiative: (id) => request(`/initiatives/${id}`),
  createInitiative: (data) => request('/initiatives', { method: 'POST', body: JSON.stringify(data) }),
  updateInitiative: (id, data) => request(`/initiatives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePipeline: (id, data) => request(`/initiatives/${id}/pipeline`, { method: 'PUT', body: JSON.stringify(data) }),
  getActuals: (id) => request(`/initiatives/${id}/actuals`),
  upsertActual: (id, data) => request(`/initiatives/${id}/actuals`, { method: 'PUT', body: JSON.stringify(data) }),

  listSnapshots: () => request('/snapshots'),
  takeSnapshot: (data) => request('/snapshots', { method: 'POST', body: JSON.stringify(data) }),
  getSnapshot: (snapshotId) => request(`/snapshots/${snapshotId}`),
  compareSnapshots: (a, b) => request(`/snapshots/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),
  deleteSnapshot: (snapshotId) => request(`/snapshots/${snapshotId}`, { method: 'DELETE' }),

  getFlags: () => request('/flags'),
};
