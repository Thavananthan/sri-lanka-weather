import { DEFAULT_LOCATIONS } from '../config/constants';
import { useAppStore } from '../store/appStore';
import type { Location } from '../types/weather';

interface Props {
  selected: Location;
  onSelect: (location: Location) => void;
  onLocate: () => void;
  isLocating: boolean;
}

export function LocationPicker({ selected, onSelect, onLocate, isLocating }: Props) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  // Favorites first, then defaults that are not already favorites.
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const defaults = DEFAULT_LOCATIONS.filter((d) => !favoriteIds.has(d.id));

  const renderChip = (loc: Location, isFavorite: boolean) => {
    const active = loc.id === selected.id;
    return (
      <div key={loc.id} className={`chip${active ? ' chip--active' : ''}`}>
        <button
          type="button"
          className="chip__label"
          aria-pressed={active}
          onClick={() => onSelect(loc)}
        >
          {loc.name}
        </button>
        <button
          type="button"
          className="chip__star"
          aria-label={`${isFavorite ? 'Remove' : 'Save'} ${loc.name} ${isFavorite ? 'from' : 'to'} favorites`}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(loc)}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
    );
  };

  return (
    <section className="location-picker" aria-label="Locations">
      <div className="location-picker__row">
        <button type="button" className="locate-btn" onClick={onLocate} disabled={isLocating}>
          <span aria-hidden="true">📍</span> {isLocating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      {favorites.length > 0 && (
        <>
          <h2 className="section-label">Favorites</h2>
          <div className="chip-row">
            {favorites.map((f) => renderChip(f, true))}
          </div>
        </>
      )}

      <h2 className="section-label">Popular cities</h2>
      <div className="chip-row">
        {defaults.map((d) => renderChip(d, false))}
      </div>
    </section>
  );
}
