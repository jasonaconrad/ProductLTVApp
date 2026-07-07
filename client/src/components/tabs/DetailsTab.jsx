import { STATUSES } from '../../constants.js';

export default function DetailsTab({ draft, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Status</span>
        <select
          value={draft.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Owner</span>
        <input
          type="text"
          value={draft.owner || ''}
          onChange={(e) => onChange({ owner: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Target launch date</span>
        <input
          type="month"
          value={draft.target_launch || ''}
          onChange={(e) => onChange({ target_launch: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Forecasted launch date</span>
        <input
          type="month"
          value={draft.forecast_launch || ''}
          onChange={(e) => onChange({ forecast_launch: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Ramp % to target rollout</span>
        <input
          type="number"
          min="0"
          max="100"
          value={draft.ramp_pct ?? 0}
          onChange={(e) => onChange({ ramp_pct: Number(e.target.value) })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>

      <label className="col-span-2 flex flex-col gap-1">
        <span className="text-label12 font-medium text-gray-500">Notes</span>
        <textarea
          rows={3}
          value={draft.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
        />
      </label>
    </div>
  );
}
