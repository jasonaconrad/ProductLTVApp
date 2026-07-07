import { computeConfidence } from '../../confidence.js';
import { ConfidenceBar } from '../Pills.jsx';
import { confidenceTier, CONFIDENCE_STYLES } from '../../constants.js';

export default function ProgressTab({ draft, onChange }) {
  const { score, factors } = computeConfidence({
    status: draft.status,
    targetLaunch: draft.target_launch,
    forecastLaunch: draft.forecast_launch,
    targetProgress: draft.target_progress,
    actualProgress: draft.actual_progress,
    rampPct: draft.ramp_pct,
  });
  const tier = confidenceTier(score);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-label12 font-medium text-gray-500">Progress metric</span>
        <div className="mt-1 flex overflow-hidden rounded-md border border-gray-300">
          <button
            type="button"
            onClick={() => onChange({ progress_metric: 'attach' })}
            className={`flex-1 px-3 py-1.5 text-base13 font-medium transition ${
              draft.progress_metric === 'attach' ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Attach rate
          </button>
          <button
            type="button"
            onClick={() => onChange({ progress_metric: 'enablement' })}
            className={`flex-1 px-3 py-1.5 text-base13 font-medium transition ${
              draft.progress_metric === 'enablement' ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            % of client base enabled
          </button>
        </div>
        <p className="mt-1.5 text-label12 text-gray-500">
          Use <span className="font-medium">attach rate</span> for PEPM / per-unit pricing initiatives.
          Use <span className="font-medium">% of client base enabled</span> for fee increases, bundle rollouts, and pricing changes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">Target %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={draft.target_progress ?? 0}
            onChange={(e) => onChange({ target_progress: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label12 font-medium text-gray-500">Actual %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={draft.actual_progress ?? 0}
            onChange={(e) => onChange({ actual_progress: Number(e.target.value) })}
            className="rounded border border-gray-300 px-2 py-1.5 text-base13 focus:border-navy focus:outline-none"
          />
        </label>
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-label12 font-semibold uppercase tracking-wide text-gray-500">Live confidence preview</span>
          <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${CONFIDENCE_STYLES[tier]}`}>{score}%</span>
        </div>
        <ConfidenceBar score={score} className="mb-3" />
        <table className="w-full text-label12">
          <tbody>
            {factors.map((f) => (
              <tr key={f.key} className="border-t border-gray-200 first:border-t-0">
                <td className="py-1.5 pr-2 font-medium text-gray-600">{f.name}</td>
                <td className="py-1.5 pr-2 text-gray-500">{f.label}</td>
                <td className="py-1.5 text-right font-semibold text-gray-700">{f.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
