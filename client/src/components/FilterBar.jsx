import { STATUSES } from '../constants.js';

export default function FilterBar({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-6 py-2.5">
      <input
        type="text"
        placeholder="Search initiatives…"
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        className="w-56 rounded border border-gray-300 px-2 py-1 text-base13 focus:border-navy focus:outline-none"
      />

      <select
        value={filters.platform}
        onChange={(e) => update('platform', e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-base13 focus:border-navy focus:outline-none"
      >
        <option value="">All platforms</option>
        <option value="Flex">Flex</option>
        <option value="Paycor">Paycor</option>
        <option value="Both">Both</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-base13 focus:border-navy focus:outline-none"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.fy}
        onChange={(e) => update('fy', e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-base13 focus:border-navy focus:outline-none"
      >
        <option value="">All fiscal years</option>
        <option value="FY26">FY26</option>
        <option value="FY27">FY27</option>
      </select>

      {(filters.search || filters.platform || filters.status || filters.fy) && (
        <button
          type="button"
          onClick={() => onChange({ search: '', platform: '', status: '', fy: '' })}
          className="text-label12 font-medium text-navy hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
