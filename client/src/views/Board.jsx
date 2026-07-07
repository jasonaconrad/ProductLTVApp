import { STATUSES } from '../constants.js';
import { PlatformPill, FyPill, MetricPill, ConfidenceBadge, ProgressBar } from '../components/Pills.jsx';
import { formatCurrency } from '../format.js';

function InitiativeCard({ initiative, flagged, onSelect }) {
  const target = initiative.fy === 'FY28'
    ? initiative.fy28_target
    : initiative.fy === 'FY27'
      ? initiative.fy27_target
      : initiative.fy26_target;

  return (
    <button
      type="button"
      onClick={() => onSelect(initiative.id)}
      className={`w-full rounded-md border bg-white p-3 text-left shadow-sm transition hover:shadow-md ${
        flagged ? 'border-l-4 border-l-orange-500 border-gray-200' : 'border-gray-200'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug text-gray-900">{initiative.name}</span>
        <ConfidenceBadge score={initiative.confidence_score} />
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <PlatformPill platform={initiative.platform} />
        <FyPill fy={initiative.fy} />
        <MetricPill metric={initiative.progress_metric} />
      </div>

      <div className="mb-2 text-label12 text-gray-500">
        {initiative.fy} target: <span className="font-medium text-gray-700">{formatCurrency(target)}</span>
      </div>

      {initiative.target_progress > 0 && (
        <ProgressBar actual={initiative.actual_progress} target={initiative.target_progress} />
      )}
    </button>
  );
}

export default function Board({ initiatives, flaggedIds, onSelect }) {
  if (initiatives.length === 0) {
    return <div className="flex h-full items-center justify-center text-gray-400">No initiatives match the current filters.</div>;
  }

  return (
    <div className="grid h-full grid-cols-5 gap-3 overflow-x-auto p-4">
      {STATUSES.map((status) => {
        const items = initiatives.filter((i) => i.status === status);
        return (
          <div key={status} className="flex min-w-[220px] flex-col rounded-md bg-gray-100/70">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-gray-700">{status}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-label12 text-gray-500">{items.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
              {items.map((initiative) => (
                <InitiativeCard
                  key={initiative.id}
                  initiative={initiative}
                  flagged={flaggedIds.has(initiative.id)}
                  onSelect={onSelect}
                />
              ))}
              {items.length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-3 text-center text-label12 text-gray-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
