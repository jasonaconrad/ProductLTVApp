const FLAG_LABELS = {
  no_forecast_launch: 'No forecasted launch',
  launch_past_target: 'Launch behind target',
  progress_behind: 'Progress behind schedule',
  low_ramp: 'Low ramp on major initiative',
  no_target_launch: 'No target launch set',
};

export default function Flags({ flags, onSelect }) {
  if (flags.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No flags — the portfolio is in good shape.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {flags.map((flag, idx) => (
        <button
          key={`${flag.initiative_id}-${flag.flag}-${idx}`}
          type="button"
          onClick={() => onSelect(flag.initiative_id)}
          className="flex items-center justify-between rounded-md border border-l-4 border-orange-500 border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md"
        >
          <div>
            <div className="text-base13 font-semibold text-gray-900">{flag.name}</div>
            <div className="text-label12 text-gray-500">{flag.description}</div>
          </div>
          <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-label12 font-medium text-orange-700">
            {FLAG_LABELS[flag.flag] || flag.flag}
          </span>
        </button>
      ))}
    </div>
  );
}
