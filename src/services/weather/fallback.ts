import type { Location, WeatherBundle } from '../../types/weather';
import type { WeatherProvider } from './types';

/**
 * Tries providers in order and returns the first successful result.
 * Aborts are re-thrown immediately so a cancelled request never falls through to the next provider.
 */
export function withFallback(providers: WeatherProvider[]): WeatherProvider {
  return {
    id: providers.map((p) => p.id).join('>'),
    async getForecast(location: Location, signal?: AbortSignal): Promise<WeatherBundle> {
      let lastError: unknown;
      for (const provider of providers) {
        try {
          return await provider.getForecast(location, signal);
        } catch (error) {
          if (signal?.aborted) throw error;
          lastError = error;
          console.warn(`[weather] provider "${provider.id}" failed, trying next`, error);
        }
      }
      throw lastError ?? new Error('No weather providers configured.');
    },
  };
}
