import { openMeteoProvider } from './openMeteo';
import { withFallback } from './fallback';
import type { WeatherProvider } from './types';

export type { WeatherProvider } from './types';

/**
 * Single entry point the app uses. Primary source is Open-Meteo (no key needed).
 * To add OpenWeatherMap as a fallback later, append its provider here:
 *   withFallback([openMeteoProvider, openWeatherMapProvider])
 */
export const weatherService: WeatherProvider = withFallback([openMeteoProvider]);
