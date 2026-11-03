export function WeatherSkeleton() {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite" aria-label="Loading weather">
      <div className="card skeleton skeleton--hero" />
      <div className="card skeleton skeleton--list" />
      <div className="card skeleton skeleton--list" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card error-card" role="alert">
      <span className="error-card__icon" aria-hidden="true">⚠️</span>
      <p>{message}</p>
      <button type="button" className="btn" onClick={onRetry}>Try again</button>
    </div>
  );
}

export function StaleBanner({ message }: { message: string }) {
  return (
    <div className="banner" role="status">
      {message}
    </div>
  );
}

export function PullIndicator({ distance, ready, refreshing }: { distance: number; ready: boolean; refreshing: boolean }) {
  if (distance <= 0 && !refreshing) return null;
  return (
    <div className="pull-indicator" style={{ height: refreshing ? 48 : Math.min(distance, 80) }} aria-hidden="true">
      <span className={refreshing ? 'spin' : undefined} style={{ transform: refreshing ? undefined : `rotate(${distance * 3}deg)` }}>
        {refreshing ? '⟳' : ready ? '↑ Release to refresh' : '↓ Pull to refresh'}
      </span>
    </div>
  );
}
