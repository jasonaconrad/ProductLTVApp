import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { QUARTERS } from '../constants.js';
import DetailsTab from './tabs/DetailsTab.jsx';
import ProgressTab from './tabs/ProgressTab.jsx';
import RevenueTab from './tabs/RevenueTab.jsx';
import QuarterlyTab from './tabs/QuarterlyTab.jsx';
import ConfidenceTab from './tabs/ConfidenceTab.jsx';

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'progress', label: 'Progress Metric' },
  { key: 'revenue', label: 'Revenue Targets' },
  { key: 'quarterly', label: 'Quarterly Realization' },
  { key: 'confidence', label: 'Confidence' },
];

function buildActualsDraft(actuals) {
  const map = Object.fromEntries(QUARTERS.map((p) => [p, { target_rev: 0, actual_rev: 0 }]));
  for (const row of actuals || []) {
    map[row.period] = { target_rev: row.target_rev, actual_rev: row.actual_rev };
  }
  return map;
}

export default function InitiativeModal({ initiativeId, onClose, onSaved, onCloned, onDeleted }) {
  const [activeTab, setActiveTab] = useState('details');
  const [draft, setDraft] = useState(null);
  const [actualsDraft, setActualsDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatedBy, setUpdatedBy] = useState(() => localStorage.getItem('pipeline_updated_by') || '');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInitiative(initiativeId);
      setDraft(data);
      setActualsDraft(buildActualsDraft(data.actuals));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [initiativeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateActual = (period, field, value) => {
    setActualsDraft((prev) => ({ ...prev, [period]: { ...prev[period], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    localStorage.setItem('pipeline_updated_by', updatedBy);
    try {
      await api.updateInitiative(initiativeId, {
        name: draft.name,
        platform: draft.platform,
        segment: draft.segment,
        status: draft.status,
        fy: draft.fy,
        rev_type: draft.rev_type,
        owner: draft.owner,
        fy26_target: draft.fy26_target,
        fy27_target: draft.fy27_target,
        fy28_target: draft.fy28_target,
        pepm: draft.pepm,
        progress_metric: draft.progress_metric,
        notes: draft.notes,
      });

      await api.updatePipeline(initiativeId, {
        status: draft.status,
        target_launch: draft.target_launch || null,
        forecast_launch: draft.forecast_launch || null,
        target_progress: draft.target_progress,
        actual_progress: draft.actual_progress,
        ramp_pct: draft.ramp_pct,
        updated_by: updatedBy || null,
      });

      await Promise.all(
        QUARTERS.map((period) => {
          const row = actualsDraft[period];
          const target = Number(row.target_rev) || 0;
          const actual = Number(row.actual_rev) || 0;
          return api.upsertActual(initiativeId, {
            period,
            target_rev: target,
            actual_rev: actual,
            progress_actual: target > 0 ? Math.round((actual / target) * 1000) / 10 : 0,
            entered_by: updatedBy || null,
          });
        })
      );

      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async () => {
    setCloning(true);
    setError(null);
    try {
      const clone = await api.cloneInitiative(initiativeId);
      onCloned(clone.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteInitiative(initiativeId);
      onDeleted();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{draft?.name || 'Initiative'}</h2>
            {draft && <p className="text-label12 text-gray-500">{draft.platform} · {draft.fy} · {draft.segment || 'No segment'}</p>}
          </div>
          <div className="flex items-center gap-3">
            {draft && (
              <>
                <button
                  type="button"
                  onClick={handleClone}
                  disabled={cloning}
                  className="text-label12 font-medium text-navy hover:underline disabled:opacity-50"
                >
                  {cloning ? 'Cloning…' : 'Clone'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-label12 font-medium text-red-500 hover:underline disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {loading && <div className="flex-1 p-8 text-center text-gray-400">Loading…</div>}

        {!loading && draft && (
          <>
            <div className="flex gap-1 border-b border-gray-200 px-5 pt-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 px-2.5 py-2 text-label12 font-medium transition ${
                    activeTab === tab.key ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeTab === 'details' && <DetailsTab draft={draft} onChange={updateDraft} />}
              {activeTab === 'progress' && <ProgressTab draft={draft} onChange={updateDraft} />}
              {activeTab === 'revenue' && <RevenueTab draft={draft} onChange={updateDraft} />}
              {activeTab === 'quarterly' && <QuarterlyTab actuals={actualsDraft} onChange={updateActual} />}
              {activeTab === 'confidence' && <ConfidenceTab draft={draft} />}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3">
              <input
                type="text"
                placeholder="Your name (for audit log)"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
                className="w-48 rounded border border-gray-300 px-2 py-1 text-label12 focus:border-navy focus:outline-none"
              />
              <div className="flex items-center gap-3">
                {error && <span className="text-label12 text-red-500">{error}</span>}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-3 py-1.5 text-base13 font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-navy px-4 py-1.5 text-base13 font-medium text-white transition hover:bg-navy/90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </>
        )}

        {!loading && error && !draft && (
          <div className="flex-1 p-8 text-center text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
}
