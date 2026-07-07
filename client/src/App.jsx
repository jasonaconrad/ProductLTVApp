import { useEffect, useMemo, useState, useCallback } from 'react';
import Topbar from './components/Topbar.jsx';
import NavTabs from './components/NavTabs.jsx';
import FilterBar from './components/FilterBar.jsx';
import Board from './views/Board.jsx';
import ListView from './views/List.jsx';
import Forecast from './views/Forecast.jsx';
import Snapshots from './views/Snapshots.jsx';
import Flags from './views/Flags.jsx';
import InitiativeModal from './components/InitiativeModal.jsx';
import AddInitiativeModal from './components/AddInitiativeModal.jsx';
import { api } from './api.js';

const EMPTY_FILTERS = { search: '', platform: '', status: '', fy: '' };

export default function App() {
  const [view, setView] = useState('board');
  const [initiatives, setInitiatives] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [initiativesData, flagsData] = await Promise.all([api.listInitiatives(), api.getFlags()]);
      setInitiatives(initiativesData);
      setFlags(flagsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const flaggedIds = useMemo(() => new Set(flags.map((f) => f.initiative_id)), [flags]);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((i) => {
      if (filters.platform && i.platform !== filters.platform) return false;
      if (filters.status && i.status !== filters.status) return false;
      if (filters.fy && i.fy !== filters.fy) return false;
      if (filters.search && !i.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [initiatives, filters]);

  const showFilterBar = view === 'board' || view === 'list';

  return (
    <div className="flex h-screen flex-col">
      <Topbar onAddInitiative={() => setShowAdd(true)} />
      <NavTabs view={view} onChange={setView} flagCount={flags.length} />
      {showFilterBar && <FilterBar filters={filters} onChange={setFilters} />}

      <main className="flex-1 overflow-auto">
        {loading && (
          <div className="flex h-full items-center justify-center text-gray-400">Loading pipeline…</div>
        )}

        {!loading && error && (
          <div className="flex h-full items-center justify-center text-red-500">
            Failed to load: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {view === 'board' && (
              <Board initiatives={filteredInitiatives} flaggedIds={flaggedIds} onSelect={setSelectedId} />
            )}
            {view === 'list' && (
              <ListView initiatives={filteredInitiatives} flaggedIds={flaggedIds} onSelect={setSelectedId} />
            )}
            {view === 'forecast' && <Forecast initiatives={initiatives} />}
            {view === 'snapshots' && <Snapshots />}
            {view === 'flags' && <Flags flags={flags} onSelect={setSelectedId} />}
          </>
        )}
      </main>

      {selectedId && (
        <InitiativeModal
          initiativeId={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={refresh}
        />
      )}

      {showAdd && (
        <AddInitiativeModal
          onClose={() => setShowAdd(false)}
          onCreated={(id) => {
            setShowAdd(false);
            refresh();
            setSelectedId(id);
          }}
        />
      )}
    </div>
  );
}
