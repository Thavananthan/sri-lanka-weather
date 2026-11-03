import { describeWeatherCode } from '../utils/weatherCodes';
import { formatHour, formatPct, formatTemp } from '../utils/format';
import type { HourlyPoint } from '../types/weather';

export function HourlyForecast({ hours }: { hours: HourlyPoint[] }) {
  if (hours.length === 0) return null;

  return (
    <section className="card" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="card__title">Next 24 hours</h2>
      <ul className="hourly" aria-label="Hourly forecast">
        {hours.map((h) => {
          const hour = Number(formatHour(h.time).slice(0, 2));
          const info = describeWeatherCode(h.weatherCode, hour >= 6 && hour < 18);
          return (
            <li key={h.time} className="hourly__item">
              <span className="hourly__time">{formatHour(h.time)}</span>
              <span className="hourly__icon" role="img" aria-label={info.label}>{info.emoji}</span>
              <span className="hourly__temp">{formatTemp(h.temperatureC)}</span>
              <span className="hourly__rain">{formatPct(h.precipitationProbabilityPct)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
