import { formatCurrencyFull } from '../../format.js';
import { FISCAL_YEARS } from '../../constants.js';

function QuarterRow({ period, data, onChange }) {
  const target = Number(data.target_rev) || 0;
  const actual = Number(data.actual_rev) || 0;
  const filled = target > 0 || actual > 0;
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const label = period.split('-')[1];

  return (
    <div className={`rounded-md border p-2.5 ${filled ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
      <div className="mb-1.5 text-label12 font-semibold text-gray-600">{label}</div>
      <div className="flex flex-col gap-1.5">
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] text-gray-400">Target</span>
          <input
            type="number"
            value={data.target_rev ?? 0}
            onChange={(e) => onChange(period, 'target_rev', Number(e.target.value))}
            className="w-full min-w-0 rounded border border-gray-300 px-1.5 py-1 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] text-gray-400">Actual</span>
          <input
            type="number"
            value={data.actual_rev ?? 0}
            onChange={(e) => onChange(period, 'actual_rev', Number(e.target.value))}
            className="w-full min-w-0 rounded border border-gray-300 px-1.5 py-1 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
      </div>
      {target > 0 && (
        <div className="mt-1.5">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div className="h-1.5 rounded-full bg-navy" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            {formatCurrencyFull(actual)} / {formatCurrencyFull(target)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuarterlyTab({ actuals, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      {FISCAL_YEARS.map((fy) => {
        const periods = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => `${fy}-${q}`);
        return (
          <div key={fy}>
            <div className="mb-2 text-label12 font-semibold uppercase tracking-wide text-gray-500">{fy}</div>
            <div className="grid grid-cols-4 gap-2">
              {periods.map((period) => (
                <QuarterRow key={period} period={period} data={actuals[period] || {}} onChange={onChange} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
