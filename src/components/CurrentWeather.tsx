import { describeWeatherCode } from '../utils/weatherCodes';
import { formatMm, formatPct, formatTemp, windDirectionLabel } from '../utils/format';
import type { WeatherBundle } from '../types/weather';

export function CurrentWeather({ data }: { data: WeatherBundle }) {
  const { current, location } = data;
  const info = describeWeatherCode(current.weatherCode, current.isDay);

  const metrics = [
    { label: 'Feels like', value: formatTemp(current.feelsLikeC), icon: '🌡️' },
    { label: 'Humidity', value: formatPct(current.humidityPct), icon: '💧' },
    {
      label: 'Wind',
      value: `${Math.round(current.windSpeedKmh)} km/h ${windDirectionLabel(current.windDirectionDeg)}`,
      icon: '💨',
    },
    { label: 'Precipitation', value: formatMm(current.precipitationMm), icon: '🌧️' },
  ];

  return (
    <section className="card current" aria-labelledby="current-heading">
      <div className="current__top">
        <div>
          <h2 id="current-heading" className="current__city">
            {location.name}
            {location.isCurrentLocation && <span className="badge">GPS</span>}
          </h2>
          {location.admin1 && <p className="muted">{location.admin1}</p>}
        </div>
        <span className="current__icon" role="img" aria-label={info.label}>
          {info.emoji}
        </span>
      </div>

      <div className="current__temp">
        <span className="current__value">{formatTemp(current.temperatureC)}</span>
        <span className="current__label">{info.label}</span>
      </div>

      <ul className="metrics">
        {metrics.map((m) => (
          <li key={m.label} className="metric">
            <span className="metric__icon" aria-hidden="true">{m.icon}</span>
            <span className="metric__label">{m.label}</span>
            <span className="metric__value">{m.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
