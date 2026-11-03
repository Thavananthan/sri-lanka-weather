import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTO_REFRESH_MS, STALE_AFTER_MS } from '../config/constants';
import { weatherService } from '../services/weather';
import type { Location, WeatherBundle } from '../types/weather';

export type WeatherStatus = 'loading' | 'success' | 'error';

export interface WeatherState {
  data: WeatherBundle | null;
  status: WeatherStatus;
  /** True while a background or manual refresh runs and cached data is already shown. */
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface Internal {
  /** Which location this state belongs to, so a city switch never shows the previous city's data. */
  key: string;
  data: WeatherBundle | null;
  status: WeatherStatus;
  isRefreshing: boolean;
  error: string | null;
}

const locationKey = (loc: Location) => `${loc.id}|${loc.latitude}|${loc.longitude}`;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong while loading weather.';

/**
 * Loads weather for a location, keeps it fresh (interval + when the app returns
 * to the foreground), and cancels in-flight requests when the location changes.
 */
export function useWeather(location: Location): WeatherState {
  const key = locationKey(location);
  const [state, setState] = useState<Internal>({
    key,
    data: null,
    status: 'loading',
    isRefreshing: false,
    error: null,
  });

  const locationRef = useRef(location);
  const dataRef = useRef<WeatherBundle | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async (target: Location) => {
    const targetKey = locationKey(target);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => {
      const sameLocation = prev.key === targetKey;
      const hasData = sameLocation && prev.data !== null;
      return {
        key: targetKey,
        data: hasData ? prev.data : null,
        status: hasData ? 'success' : 'loading',
        isRefreshing: hasData,
        error: sameLocation ? prev.error : null,
      };
    });

    try {
      const bundle = await weatherService.getForecast(target, controller.signal);
      if (controller.signal.aborted) return;
      dataRef.current = bundle;
      setState({ key: targetKey, data: bundle, status: 'success', isRefreshing: false, error: null });
    } catch (err) {
      if (controller.signal.aborted) return;
      setState((prev) => {
        const hasData = prev.key === targetKey && prev.data !== null;
        return {
          key: targetKey,
          data: hasData ? prev.data : null,
          // Keep showing the last good data; only a cold start shows the error state.
          status: hasData ? 'success' : 'error',
          isRefreshing: false,
          error: errorMessage(err),
        };
      });
    }
  }, []);

  const refresh = useCallback(() => load(locationRef.current), [load]);

  // Ref is updated in an effect (not during render) and effects run in declaration order,
  // so this must stay above the load effect.
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    void load(location);
    return () => controllerRef.current?.abort();
  }, [location, load]);

  useEffect(() => {
    const interval = window.setInterval(() => void refresh(), AUTO_REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const cached = dataRef.current;
      const isStale = !cached || Date.now() - cached.fetchedAt > STALE_AFTER_MS;
      if (isStale) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const isCurrent = state.key === key;
  return {
    data: isCurrent ? state.data : null,
    status: isCurrent ? state.status : 'loading',
    isRefreshing: isCurrent && state.isRefreshing,
    error: isCurrent ? state.error : null,
    refresh,
  };
}
