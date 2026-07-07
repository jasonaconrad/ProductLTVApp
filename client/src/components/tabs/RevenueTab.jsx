export default function RevenueTab({ draft, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">FY26 target ($)</span>
          <input
            type="number"
            value={draft.fy26_target ?? 0}
            onChange={(e) => onChange({ fy26_target: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">FY27 target ($)</span>
          <input
            type="number"
            value={draft.fy27_target ?? 0}
            onChange={(e) => onChange({ fy27_target: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">FY28 target ($)</span>
          <input
            type="number"
            value={draft.fy28_target ?? 0}
            onChange={(e) => onChange({ fy28_target: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">PEPM ($)</span>
          <input
            type="number"
            step="0.01"
            value={draft.pepm ?? 0}
            onChange={(e) => onChange({ pepm: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">Revenue type</span>
          <input
            type="text"
            value={draft.rev_type || ''}
            onChange={(e) => onChange({ rev_type: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
      </div>

      <p className="rounded-md bg-blue-50 px-3 py-2 text-label12 text-blue-700">
        Changing targets here updates the confidence-weighted forecast immediately on save.
      </p>
    </div>
  );
}
