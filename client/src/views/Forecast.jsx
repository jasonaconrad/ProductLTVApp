import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QUARTERS, FISCAL_YEARS } from '../constants.js';
import { formatCurrency, formatCurrencyFull } from '../format.js';
import { api } from '../api.js';

function SummaryCard({ fy, target, weighted }) {
  const pct = target > 0 ? Math.round((weighted / target) * 100) : 0;
  return (
    <div className="flex-1 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-label12 font-semibold uppercase tracking-wide text-gray-500">{fy} Revenue</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(target)}</span>
        <span className="text-label12 text-gray-400">target</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-navy">{formatCurrency(weighted)}</span>
        <span className="text-label12 text-gray-400">confidence-weighted ({pct}%)</span>
      </div>
    </div>
  );
}

export default function Forecast({ initiatives }) {
  const [quarterTotals, setQuarterTotals] = useState({});
  const [loadingQuarters, setLoadingQuarters] = useState(true);

  const summary = useMemo(() => {
    const result = Object.fromEntries(FISCAL_YEARS.map((fy) => [fy, { target: 0, weighted: 0 }]));
    for (const i of initiatives) {
      const weight = (i.confidence_score || 0) / 100;
      for (const fy of FISCAL_YEARS) {
        const target = i[`${fy.toLowerCase()}_target`] || 0;
        result[fy].target += target;
        result[fy].weighted += target * weight;
      }
    }
    return result;
  }, [initiatives]);

  const platformTotals = useMemo(() => {
    const platforms = ['Flex', 'Paycor', 'Both'];
    const byPlatform = Object.fromEntries(
      platforms.map((p) => [p, { platform: p, ...Object.fromEntries(FISCAL_YEARS.map((fy) => [fy, 0])) }])
    );
    for (const i of initiatives) {
      for (const fy of FISCAL_YEARS) {
        byPlatform[i.platform][fy] += i[`${fy.toLowerCase()}_target`] || 0;
      }
    }
    return Object.values(byPlatform);
  }, [initiatives]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuarterlyTotals() {
      setLoadingQuarters(true);
      const totals = Object.fromEntries(QUARTERS.map((q) => [q, { target: 0, actual: 0 }]));
      await Promise.all(
        initiatives.map(async (i) => {
          const actuals = await api.getActuals(i.id);
          for (const row of actuals) {
            if (totals[row.period]) {
              totals[row.period].target += row.target_rev || 0;
              totals[row.period].actual += row.actual_rev || 0;
            }
          }
        })
      );
      if (!cancelled) {
        setQuarterTotals(totals);
        setLoadingQuarters(false);
      }
    }
    if (initiatives.length > 0) loadQuarterlyTotals();
    else setLoadingQuarters(false);
    return () => { cancelled = true; };
  }, [initiatives]);

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex gap-4">
        {FISCAL_YEARS.map((fy) => (
          <SummaryCard key={fy} fy={fy} target={summary[fy].target} weighted={summary[fy].weighted} />
        ))}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-700">Quarterly Realization</div>
        {loadingQuarters ? (
          <div className="py-6 text-center text-gray-400">Loading quarterly totals…</div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {QUARTERS.map((q) => {
              const t = quarterTotals[q] || { target: 0, actual: 0 };
              const pct = t.target > 0 ? Math.min(100, Math.round((t.actual / t.target) * 100)) : 0;
              return (
                <div key={q} className="rounded-md border border-gray-200 p-2 text-center">
                  <div className="text-label12 font-semibold text-gray-600">{q}</div>
                  <div className="mt-1 text-xs font-medium text-gray-800">{formatCurrency(t.actual)}</div>
                  <div className="text-[11px] text-gray-400">/ {formatCurrency(t.target)}</div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                    <div className="h-1.5 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-700">Targets by Platform</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={platformTotals}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatCurrencyFull(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="FY26" fill="#1B3A5C" radius={[3, 3, 0, 0]} />
            <Bar dataKey="FY27" fill="#5B9BD5" radius={[3, 3, 0, 0]} />
            <Bar dataKey="FY28" fill="#14B8A6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
