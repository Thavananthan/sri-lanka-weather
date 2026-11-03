import type { Location } from '../../types/weather';
import { fetchJson } from '../http';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code?: string;
    admin1?: string;
  }>;
}

/** Searches places by name, biased to Sri Lanka. */
export async function searchLocations(query: string, signal?: AbortSignal): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '10',
    language: 'en',
    format: 'json',
    countryCode: 'LK',
  });
  const data = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`, signal);

  return (data.results ?? []).map((r) => ({
    id: `om-${r.id}`,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
