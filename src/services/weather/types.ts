import type { Location, WeatherBundle } from '../../types/weather';

/**
 * Contract every weather data source implements. To add a fallback source
 * (e.g. OpenWeatherMap), implement this interface and register it in
 * `services/weather/index.ts`.
 */
export interface WeatherProvider {
  readonly id: string;
  getForecast(location: Location, signal?: AbortSignal): Promise<WeatherBundle>;
}
