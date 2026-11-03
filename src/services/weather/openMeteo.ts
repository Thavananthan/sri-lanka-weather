import type { CurrentConditions, DailyPoint, HourlyPoint, Location, WeatherBundle } from '../../types/weather';
import { TIMEZONE, nowInColomboKey } from '../../utils/format';
import { fetchJson } from '../http';
import type { WeatherProvider } from './types';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const HOURS_AHEAD = 24;
const FORECAST_DAYS = 7;

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'is_day',
];
const HOURLY_VARS = ['temperature_2m', 'weather_code', 'precipitation_probability', 'precipitation'];
const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
];

/** Raw response shape from api.open-meteo.com (only the fields we request). */
export interface OpenMeteoResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
}

/** Maps the raw Open-Meteo payload into the app's domain model. Pure, so it is easy to unit test. */
export function mapOpenMeteoResponse(
  raw: OpenMeteoResponse,
  location: Location,
  now: string = nowInColomboKey(),
  fetchedAt: number = Date.now(),
): WeatherBundle {
  const c = raw.current;
  const current: CurrentConditions = {
    time: c.time,
    temperatureC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidityPct: c.relative_humidity_2m,
    windSpeedKmh: c.wind_speed_10m,
    windDirectionDeg: c.wind_direction_10m,
    precipitationMm: c.precipitation,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
  };

  // Hourly times are local strings, so lexical comparison against the local "now" key is correct.
  const startIndex = Math.max(
    0,
    raw.hourly.time.findIndex((t) => t >= now.slice(0, 13) + ':00'),
  );
  const hourly: HourlyPoint[] = raw.hourly.time
    .slice(startIndex, startIndex + HOURS_AHEAD)
    .map((time, i) => {
      const idx = startIndex + i;
      return {
        time,
        temperatureC: raw.hourly.temperature_2m[idx],
        weatherCode: raw.hourly.weather_code[idx],
        precipitationProbabilityPct: raw.hourly.precipitation_probability[idx] ?? null,
        precipitationMm: raw.hourly.precipitation[idx],
      };
    });

  const daily: DailyPoint[] = raw.daily.time.slice(0, FORECAST_DAYS).map((date, i) => ({
    date,
    weatherCode: raw.daily.weather_code[i],
    temperatureMaxC: raw.daily.temperature_2m_max[i],
    temperatureMinC: raw.daily.temperature_2m_min[i],
    precipitationSumMm: raw.daily.precipitation_sum[i],
    precipitationProbabilityMaxPct: raw.daily.precipitation_probability_max[i] ?? null,
    sunrise: raw.daily.sunrise[i],
    sunset: raw.daily.sunset[i],
  }));

  return { location, current, hourly, daily, timezone: raw.timezone, source: 'open-meteo', fetchedAt };
}

export function buildOpenMeteoUrl(location: Location): string {
  const params = new URLSearchParams({
    latitude: location.latitude.toFixed(4),
    longitude: location.longitude.toFixed(4),
    current: CURRENT_VARS.join(','),
    hourly: HOURLY_VARS.join(','),
    daily: DAILY_VARS.join(','),
    timezone: TIMEZONE,
    forecast_days: String(FORECAST_DAYS),
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    temperature_unit: 'celsius',
  });
  return `${FORECAST_URL}?${params}`;
}

export const openMeteoProvider: WeatherProvider = {
  id: 'open-meteo',
  async getForecast(location, signal) {
    const raw = await fetchJson<OpenMeteoResponse>(buildOpenMeteoUrl(location), signal);
    return mapOpenMeteoResponse(raw, location);
  },
};
