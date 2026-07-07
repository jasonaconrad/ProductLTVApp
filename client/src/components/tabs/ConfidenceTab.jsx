import { computeConfidence } from '../../confidence.js';
import { ConfidenceBar } from '../Pills.jsx';
import { confidenceTier, CONFIDENCE_STYLES } from '../../constants.js';

export default function ConfidenceTab({ draft }) {
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
      <div className="flex flex-col items-center gap-2 py-2">
        <span className={`rounded-full px-5 py-2 text-3xl font-bold ${CONFIDENCE_STYLES[tier]}`}>{score}%</span>
        <ConfidenceBar score={score} className="w-full max-w-md" />
      </div>

      <table className="w-full overflow-hidden rounded-md border border-gray-200 text-base13">
        <thead>
          <tr className="bg-gray-50 text-left text-label12 font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-3 py-2">Factor</th>
            <th className="px-3 py-2">Current value</th>
            <th className="px-3 py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((f) => (
            <tr key={f.key} className="border-t border-gray-100">
              <td className="px-3 py-2 font-medium text-gray-700">{f.name}</td>
              <td className="px-3 py-2 text-gray-500">{f.label}</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-700">{f.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-label12 text-gray-500">
        confidence = status weight × launch factor × progress factor × ramp factor × 100
      </p>
    </div>
  );
}
