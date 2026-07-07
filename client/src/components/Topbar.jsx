export default function Topbar({ onAddInitiative }) {
  return (
    <header className="flex items-center justify-between bg-navy px-6 py-3 text-white shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">Product Revenue Pipeline Tracker</span>
        <span className="rounded bg-white/10 px-2 py-0.5 text-label12 text-white/70">Product Commercialization</span>
      </div>
      <button
        type="button"
        onClick={onAddInitiative}
        className="rounded-md bg-white/10 px-3 py-1.5 text-label12 font-medium text-white transition hover:bg-white/20"
      >
        + Add Initiative
      </button>
    </header>
  );
}
