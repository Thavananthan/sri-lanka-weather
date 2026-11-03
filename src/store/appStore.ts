import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LOCATIONS, STORAGE_KEYS } from '../config/constants';
import type { Location } from '../types/weather';

export type ThemeMode = 'system' | 'light' | 'dark';

interface AppState {
  favorites: Location[];
  selected: Location;
  theme: ThemeMode;
  selectLocation: (location: Location) => void;
  toggleFavorite: (location: Location) => void;
  setTheme: (theme: ThemeMode) => void;
}

const sameLocation = (a: Location, b: Location) =>
  a.id === b.id || (a.latitude === b.latitude && a.longitude === b.longitude);

/**
 * Global app state: favorites, the selected city and theme.
 * Only these are persisted to localStorage. Weather data is intentionally not persisted.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      selected: DEFAULT_LOCATIONS[0],
      theme: 'system',
      selectLocation: (location) => set({ selected: location }),
      toggleFavorite: (location) => {
        const exists = get().favorites.some((f) => sameLocation(f, location));
        set({
          favorites: exists
            ? get().favorites.filter((f) => !sameLocation(f, location))
            : [...get().favorites, location],
        });
      },
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.favorites,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites, selected: state.selected, theme: state.theme }),
      version: 1,
    },
  ),
);

export const isFavoriteLocation = (favorites: Location[], location: Location) =>
  favorites.some((f) => sameLocation(f, location));
