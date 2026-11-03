import { useEffect, useState } from 'react';
import { searchLocations } from '../services/geocoding';
import type { Location } from '../types/weather';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface Props {
  onSelect: (location: Location) => void;
}

interface SearchResult {
  query: string;
  locations: Location[];
  failed: boolean;
}

const MIN_QUERY_LENGTH = 2;

export function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 350);
  const [result, setResult] = useState<SearchResult | null>(null);

  const isActive = debounced.trim().length >= MIN_QUERY_LENGTH;
  // Results are tagged with the query they belong to, so stale results are never shown.
  const current = isActive && result?.query === debounced ? result : null;

  useEffect(() => {
    if (debounced.trim().length < MIN_QUERY_LENGTH) return;
    const controller = new AbortController();
    searchLocations(debounced, controller.signal)
      .then((locations) => setResult({ query: debounced, locations, failed: false }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn('[search] failed', err);
        setResult({ query: debounced, locations: [], failed: true });
      });
    return () => controller.abort();
  }, [debounced]);

  const handlePick = (location: Location) => {
    onSelect(location);
    setQuery('');
  };

  return (
    <div className="city-search">
      <label className="visually-hidden" htmlFor="city-search-input">Search for a city</label>
      <div className="search-field">
        <span aria-hidden="true">🔍</span>
        <input
          id="city-search-input"
          type="search"
          placeholder="Search a Sri Lankan city or town…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {isActive && (
        <ul className="search-results" role="listbox" aria-label="Search results">
          {!current && <li className="muted">Searching…</li>}
          {current?.failed && <li className="error-text">Search is unavailable right now.</li>}
          {current && !current.failed && current.locations.length === 0 && (
            <li className="muted">No matching places in Sri Lanka.</li>
          )}
          {current?.locations.map((loc) => (
            <li key={loc.id}>
              <button type="button" className="search-result" onClick={() => handlePick(loc)}>
                <span className="search-result__name">{loc.name}</span>
                <span className="search-result__meta">{[loc.admin1, loc.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
