import { useEffect, useState } from 'react';
import { CitySearch } from './components/CitySearch';
import { CurrentWeather } from './components/CurrentWeather';
import { DailyForecast } from './components/DailyForecast';
import { Header } from './components/Header';
import { HourlyForecast } from './components/HourlyForecast';
import { LocationPicker } from './components/LocationPicker';
import { ErrorState, PullIndicator, StaleBanner, WeatherSkeleton } from './components/StateViews';
import { useGeolocation } from './hooks/useGeolocation';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { useApplyTheme } from './hooks/useTheme';
import { useWeather } from './hooks/useWeather';
import { useAppStore } from './store/appStore';
import { formatRelativeTime } from './utils/format';
import { AUTO_REFRESH_MS } from './config/constants';

export default function App() {
  useApplyTheme();

  const selected = useAppStore((s) => s.selected);
  const selectLocation = useAppStore((s) => s.selectLocation);

  const weather = useWeather(selected);
  const geo = useGeolocation();
  const pull = usePullToRefresh(weather.refresh);

  // Re-render periodically so "Updated 5 min ago" stays accurate between fetches.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const { data, status, error, isRefreshing } = weather;

  const handleLocate = () => {
    geo.locate().then(selectLocation).catch(() => {
      /* error is surfaced via geo.error */
    });
  };

  return (
    <div className="app">
      <PullIndicator distance={pull.pullDistance} ready={pull.isReady} refreshing={pull.isRefreshing} />
      <Header
        onRefresh={weather.refresh}
        isRefreshing={isRefreshing}
        lastUpdatedText={data ? formatRelativeTime(data.fetchedAt, now) : null}
      />

      <main className="layout">
        <aside className="sidebar">
          <CitySearch onSelect={selectLocation} />
          <LocationPicker selected={selected} onSelect={selectLocation} onLocate={handleLocate} isLocating={geo.isLocating} />
          {geo.error && <StaleBanner message={geo.error} />}
        </aside>

        <section className="content" aria-live="polite">
          {status === 'loading' && !data && <WeatherSkeleton />}

          {status === 'error' && !data && <ErrorState message={error ?? 'Could not load weather.'} onRetry={weather.refresh} />}

          {data && (
            <>
              {error && <StaleBanner message={`Showing the last successful update. ${error}`} />}
              {isRefreshing && <p className="muted small">Refreshing…</p>}
              <CurrentWeather data={data} />
              <HourlyForecast hours={data.hourly} />
              <DailyForecast days={data.daily} />
              <p className="footnote">
                Data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>. Auto-refreshes every{' '}
                {Math.round(AUTO_REFRESH_MS / 60_000)} min.
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
