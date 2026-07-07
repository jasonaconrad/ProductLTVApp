const TABS = [
  { key: 'board', label: 'Board' },
  { key: 'list', label: 'List' },
  { key: 'forecast', label: 'Forecast' },
  { key: 'snapshots', label: 'Snapshots' },
  { key: 'flags', label: 'Flags' },
];

export default function NavTabs({ view, onChange, flagCount }) {
  return (
    <nav className="flex gap-1 border-b border-gray-200 bg-white px-6">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`relative border-b-2 px-3 py-2.5 text-sm font-medium transition ${
            view === tab.key
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          {tab.label}
          {tab.key === 'flags' && flagCount > 0 && (
            <span className="ml-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {flagCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
