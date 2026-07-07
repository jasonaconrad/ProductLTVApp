import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { FISCAL_YEARS } from '../constants.js';

const EMPTY = {
  name: '',
  platform: 'Flex',
  segment: '',
  status: 'Consideration',
  fy: 'FY26',
  rev_type: '',
  owner: '',
  fy26_target: 0,
  fy27_target: 0,
  fy28_target: 0,
  pepm: 0,
  progress_metric: 'enablement',
  notes: '',
};

export default function AddInitiativeModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.createInitiative(form);
      onCreated(created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Add Initiative</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          <label className="flex flex-col gap-1">
            <span className="text-label12 font-medium text-gray-500">Name</span>
            <input
              type="text"
              autoFocus
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Platform</span>
              <select
                value={form.platform}
                onChange={(e) => update({ platform: e.target.value })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              >
                <option value="Flex">Flex</option>
                <option value="Paycor">Paycor</option>
                <option value="Both">Both</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Fiscal year</span>
              <select
                value={form.fy}
                onChange={(e) => update({ fy: e.target.value })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              >
                {FISCAL_YEARS.map((fy) => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Segment</span>
              <input
                type="text"
                value={form.segment}
                onChange={(e) => update({ segment: e.target.value })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">Owner</span>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => update({ owner: e.target.value })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">FY26 target ($)</span>
              <input
                type="number"
                value={form.fy26_target}
                onChange={(e) => update({ fy26_target: Number(e.target.value) })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">FY27 target ($)</span>
              <input
                type="number"
                value={form.fy27_target}
                onChange={(e) => update({ fy27_target: Number(e.target.value) })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-label12 font-medium text-gray-500">FY28 target ($)</span>
              <input
                type="number"
                value={form.fy28_target}
                onChange={(e) => update({ fy28_target: Number(e.target.value) })}
                className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-label12 font-medium text-gray-500">Progress metric</span>
            <select
              value={form.progress_metric}
              onChange={(e) => update({ progress_metric: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
            >
              <option value="enablement">% of client base enabled</option>
              <option value="attach">Attach rate</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label12 font-medium text-gray-500">Notes</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-3">
          {error && <span className="mr-auto text-label12 text-red-500">{error}</span>}
          <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-base13 font-medium text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-navy px-4 py-1.5 text-base13 font-medium text-white transition hover:bg-navy/90 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Initiative'}
          </button>
        </div>
      </form>
    </div>
  );
}
