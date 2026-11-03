import { describeWeatherCode } from '../utils/weatherCodes';
import { formatDayName, formatMm, formatPct, formatTemp, nowInColomboKey } from '../utils/format';
import type { DailyPoint } from '../types/weather';

export function DailyForecast({ days }: { days: DailyPoint[] }) {
  if (days.length === 0) return null;

  const todayKey = nowInColomboKey().slice(0, 10);
  const weekMax = Math.max(...days.map((d) => d.temperatureMaxC));
  const weekMin = Math.min(...days.map((d) => d.temperatureMinC));
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <section className="card" aria-labelledby="daily-heading">
      <h2 id="daily-heading" className="card__title">7-day forecast</h2>
      <ul className="daily">
        {days.map((d) => {
          const info = describeWeatherCode(d.weatherCode, true);
          const left = ((d.temperatureMinC - weekMin) / span) * 100;
          const width = ((d.temperatureMaxC - d.temperatureMinC) / span) * 100;
          return (
            <li key={d.date} className="daily__row">
              <span className="daily__day">{formatDayName(d.date, todayKey)}</span>
              <span className="daily__icon" role="img" aria-label={info.label}>{info.emoji}</span>
              <span className="daily__rain" title="Chance of rain">{formatPct(d.precipitationProbabilityMaxPct)}</span>
              <span className="daily__min">{formatTemp(d.temperatureMinC)}</span>
              <span className="daily__bar" aria-hidden="true">
                <span className="daily__bar-fill" style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }} />
              </span>
              <span className="daily__max">{formatTemp(d.temperatureMaxC)}</span>
              <span className="daily__precip sr-only">{formatMm(d.precipitationSumMm)} expected</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
