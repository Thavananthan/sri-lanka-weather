import type { Location } from '../types/weather';

export const APP_NAME = 'Sri Lanka Weather';

/** Auto-refresh interval. The spec asks for 10–15 minutes. */
export const AUTO_REFRESH_MS = 10 * 60 * 1000;

/** Re-fetch when the app returns to foreground if data is older than this. */
export const STALE_AFTER_MS = 5 * 60 * 1000;

export const REQUEST_TIMEOUT_MS = 10_000;

export const STORAGE_KEYS = {
  favorites: 'slw.favorites.v1',
  selected: 'slw.selected.v1',
  theme: 'slw.theme.v1',
} as const;

const city = (id: string, name: string, latitude: number, longitude: number, admin1?: string): Location => ({
  id,
  name,
  admin1,
  country: 'Sri Lanka',
  latitude,
  longitude,
});

export const DEFAULT_LOCATIONS: Location[] = [
  city('colombo', 'Colombo', 6.9271, 79.8612, 'Western Province'),
  city('kandy', 'Kandy', 7.2906, 80.6337, 'Central Province'),
  city('galle', 'Galle', 6.0535, 80.221, 'Southern Province'),
  city('jaffna', 'Jaffna', 9.6615, 80.0255, 'Northern Province'),
  city('trincomalee', 'Trincomalee', 8.5874, 81.2152, 'Eastern Province'),
  city('anuradhapura', 'Anuradhapura', 8.3114, 80.4037, 'North Central Province'),
  city('batticaloa', 'Batticaloa', 7.7102, 81.6924, 'Eastern Province'),
  city('nuwara-eliya', 'Nuwara Eliya', 6.9497, 80.7891, 'Central Province'),
  city('negombo', 'Negombo', 7.2083, 79.8358, 'Western Province'),
  city('ratnapura', 'Ratnapura', 6.6828, 80.3992, 'Sabaragamuwa Province'),
  city('badulla', 'Badulla', 6.9934, 81.055, 'Uva Province'),
  city('kurunegala', 'Kurunegala', 7.4863, 80.3623, 'North Western Province'),
];
