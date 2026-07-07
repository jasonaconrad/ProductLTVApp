import { useMemo, useState } from 'react';
import { PlatformPill, FyPill, StatusPill, ConfidenceBadge } from '../components/Pills.jsx';
import { formatCurrency, formatPercent, formatMonth } from '../format.js';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'platform', label: 'Platform' },
  { key: 'fy', label: 'FY' },
  { key: 'status', label: 'Status' },
  { key: 'fy26_target', label: 'FY26 Target' },
  { key: 'fy27_target', label: 'FY27 Target' },
  { key: 'progress', label: 'Progress' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'target_launch', label: 'Launch Target' },
  { key: 'owner', label: 'Owner' },
];

export default function ListView({ initiatives, flaggedIds, onSelect }) {
  const [sortKey, setSortKey] = useState('confidence_score');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const copy = [...initiatives];
    copy.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'progress') {
        av = a.target_progress > 0 ? (a.actual_progress || 0) / a.target_progress : -1;
        bv = b.target_progress > 0 ? (b.actual_progress || 0) / b.target_progress : -1;
      }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av === bv) return 0;
      const result = av > bv ? 1 : -1;
      return sortDir === 'asc' ? result : -result;
    });
    return copy;
  }, [initiatives, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (initiatives.length === 0) {
    return <div className="flex h-full items-center justify-center text-gray-400">No initiatives match the current filters.</div>;
  }

  return (
    <div className="p-4">
      <table className="w-full border-collapse overflow-hidden rounded-md bg-white text-base13 shadow-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-label12 font-semibold uppercase tracking-wide text-gray-500">
            {COLUMNS.map((col) => (
              <th key={col.key} className="cursor-pointer select-none px-3 py-2" onClick={() => toggleSort(col.key)}>
                {col.label}
                {sortKey === col.key && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((i) => (
            <tr
              key={i.id}
              onClick={() => onSelect(i.id)}
              className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50/50 ${
                flaggedIds.has(i.id) ? 'border-l-4 border-l-orange-500' : ''
              }`}
            >
              <td className="px-3 py-2 font-medium text-gray-900">{i.name}</td>
              <td className="px-3 py-2"><PlatformPill platform={i.platform} /></td>
              <td className="px-3 py-2"><FyPill fy={i.fy} /></td>
              <td className="px-3 py-2"><StatusPill status={i.status} /></td>
              <td className="px-3 py-2 text-gray-700">{formatCurrency(i.fy26_target)}</td>
              <td className="px-3 py-2 text-gray-700">{formatCurrency(i.fy27_target)}</td>
              <td className="px-3 py-2 text-gray-700">
                {i.target_progress > 0 ? `${formatPercent(i.actual_progress)} / ${formatPercent(i.target_progress)}` : '—'}
              </td>
              <td className="px-3 py-2"><ConfidenceBadge score={i.confidence_score} /></td>
              <td className="px-3 py-2 text-gray-700">{formatMonth(i.target_launch)}</td>
              <td className="px-3 py-2 text-gray-700">{i.owner || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
