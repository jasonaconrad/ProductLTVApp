import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatCurrencyFull } from '../format.js';

const HIGHLIGHT_FIELDS = new Set(['fy26_target', 'fy27_target', 'confidence_score']);

function formatFieldValue(field, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (field === 'fy26_target' || field === 'fy27_target') return formatCurrencyFull(value);
  if (field === 'confidence_score') return `${value}%`;
  return String(value);
}

function ChangeRow({ change }) {
  const highlighted = HIGHLIGHT_FIELDS.has(change.field);
  return (
    <div className={`flex items-center gap-2 rounded px-2 py-1 text-label12 ${highlighted ? 'bg-yellow-50' : ''}`}>
      <span className={`w-40 shrink-0 font-medium ${highlighted ? 'text-yellow-800' : 'text-gray-600'}`}>{change.field}</span>
      <span className="text-gray-500">{formatFieldValue(change.field, change.from)}</span>
      <span className="text-gray-400">→</span>
      <span className="font-semibold text-gray-800">{formatFieldValue(change.field, change.to)}</span>
    </div>
  );
}

export default function Snapshots() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taking, setTaking] = useState(false);
  const [mode, setMode] = useState('list');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listSnapshots();
      setSnapshots(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleTake = async () => {
    const label = window.prompt('Label for this snapshot:');
    if (!label) return;
    setTaking(true);
    setError(null);
    try {
      await api.takeSnapshot({ label });
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setTaking(false);
    }
  };

  const handleDelete = async (snapshotId) => {
    if (!window.confirm('Delete this snapshot? This cannot be undone.')) return;
    try {
      await api.deleteSnapshot(snapshotId);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const runCompare = async () => {
    if (!compareA || !compareB) return;
    setComparing(true);
    setError(null);
    try {
      const result = await api.compareSnapshots(compareA, compareB);
      setCompareResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-md border border-gray-300 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`rounded px-3 py-1 text-label12 font-medium ${mode === 'list' ? 'bg-navy text-white' : 'text-gray-600'}`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setMode('compare')}
            className={`rounded px-3 py-1 text-label12 font-medium ${mode === 'compare' ? 'bg-navy text-white' : 'text-gray-600'}`}
          >
            Compare
          </button>
        </div>

        <button
          type="button"
          onClick={handleTake}
          disabled={taking}
          className="rounded-md bg-navy px-3 py-1.5 text-base13 font-medium text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {taking ? 'Saving…' : '+ Take Snapshot'}
        </button>
      </div>

      {error && <div className="rounded bg-red-50 px-3 py-2 text-label12 text-red-600">{error}</div>}

      {mode === 'list' && (
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading snapshots…</div>
          ) : snapshots.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No snapshots yet. Take one to start tracking portfolio history.</div>
          ) : (
            <table className="w-full text-base13">
              <thead>
                <tr className="border-b border-gray-200 text-left text-label12 font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Label</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Created by</th>
                  <th className="px-3 py-2">Initiatives</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.snapshot_id} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-800">{s.snapshot_label}</td>
                    <td className="px-3 py-2 text-gray-500">{s.snapshot_date}</td>
                    <td className="px-3 py-2 text-gray-500">{s.created_by || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{s.initiative_count}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.snapshot_id)}
                        className="text-label12 font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {mode === 'compare' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Snapshot A (baseline)</span>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-64 rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              >
                <option value="">Select…</option>
                {snapshots.map((s) => (
                  <option key={s.snapshot_id} value={s.snapshot_id}>{s.snapshot_label} ({s.snapshot_date})</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Snapshot B (compare to)</span>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-64 rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              >
                <option value="">Select…</option>
                {snapshots.map((s) => (
                  <option key={s.snapshot_id} value={s.snapshot_id}>{s.snapshot_label} ({s.snapshot_date})</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={runCompare}
              disabled={!compareA || !compareB || comparing}
              className="rounded-md bg-navy px-4 py-1.5 text-base13 font-medium text-white hover:bg-navy/90 disabled:opacity-50"
            >
              {comparing ? 'Comparing…' : 'Compare'}
            </button>
          </div>

          {compareResult && (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-green-200 bg-green-50 p-3">
                <div className="mb-2 text-label12 font-semibold uppercase tracking-wide text-green-700">
                  New initiatives ({compareResult.new_initiatives.length})
                </div>
                {compareResult.new_initiatives.length === 0 ? (
                  <div className="text-label12 text-green-600">None</div>
                ) : (
                  <ul className="flex flex-col gap-1 text-base13 text-green-800">
                    {compareResult.new_initiatives.map((n) => <li key={n.initiative_id}>{n.name}</li>)}
                  </ul>
                )}
              </div>

              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="mb-2 text-label12 font-semibold uppercase tracking-wide text-red-700">
                  Removed initiatives ({compareResult.removed_initiatives.length})
                </div>
                {compareResult.removed_initiatives.length === 0 ? (
                  <div className="text-label12 text-red-600">None</div>
                ) : (
                  <ul className="flex flex-col gap-1 text-base13 text-red-800">
                    {compareResult.removed_initiatives.map((n) => <li key={n.initiative_id}>{n.name}</li>)}
                  </ul>
                )}
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 text-label12 font-semibold uppercase tracking-wide text-gray-600">
                  Changed initiatives ({compareResult.changed.length})
                </div>
                {compareResult.changed.length === 0 ? (
                  <div className="text-label12 text-gray-400">None</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {compareResult.changed.map((c) => (
                      <div key={c.initiative_id} className="border-b border-gray-100 pb-2 last:border-b-0">
                        <div className="mb-1 text-base13 font-semibold text-gray-800">{c.name}</div>
                        <div className="flex flex-col gap-0.5">
                          {c.changes.map((change, idx) => (
                            <ChangeRow key={idx} change={change} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-label12 text-gray-400">
                {compareResult.unchanged.length} initiatives unchanged
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
