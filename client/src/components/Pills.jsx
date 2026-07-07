import { PLATFORM_STYLES, STATUS_STYLES, METRIC_STYLES, METRIC_LABELS, CONFIDENCE_STYLES, CONFIDENCE_BAR_STYLES, confidenceTier } from '../constants.js';

export function PlatformPill({ platform }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-label12 font-medium ${PLATFORM_STYLES[platform] || 'bg-gray-100 text-gray-700'}`}>
      {platform}
    </span>
  );
}

export function StatusPill({ status }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-label12 font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function FyPill({ fy }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-label12 font-medium bg-slate-100 text-slate-600 border border-slate-200">
      {fy}
    </span>
  );
}

export function MetricPill({ metric }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-label12 font-medium ${METRIC_STYLES[metric] || 'bg-gray-100 text-gray-700'}`}>
      {METRIC_LABELS[metric] || metric}
    </span>
  );
}

export function ConfidenceBadge({ score }) {
  const tier = confidenceTier(score);
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-label12 font-semibold ${CONFIDENCE_STYLES[tier]}`}>
      {Math.round(score || 0)}%
    </span>
  );
}

export function ProgressBar({ actual, target, className = '' }) {
  if (!target || target <= 0) return null;
  const pct = Math.min(100, Math.round(((actual || 0) / target) * 100));
  return (
    <div className={`h-1.5 w-full rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-1.5 rounded-full bg-navy"
        style={{ width: `${pct}%` }}
        title={`${actual || 0}% actual / ${target}% target`}
      />
    </div>
  );
}

export function ConfidenceBar({ score, className = '' }) {
  const tier = confidenceTier(score);
  return (
    <div className={`h-2 w-full rounded-full bg-gray-200 ${className}`}>
      <div className={`h-2 rounded-full ${CONFIDENCE_BAR_STYLES[tier]}`} style={{ width: `${Math.min(100, Math.max(0, score || 0))}%` }} />
    </div>
  );
}
