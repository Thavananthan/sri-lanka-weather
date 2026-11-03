import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCATIONS } from '../../../config/constants';
import { buildOpenMeteoUrl, mapOpenMeteoResponse, type OpenMeteoResponse } from '../openMeteo';

const colombo = DEFAULT_LOCATIONS[0];

/** 48 hourly points starting at local midnight on 2026-11-03, plus 8 daily points. */
function fixture(): OpenMeteoResponse {
  const hourlyTimes = Array.from({ length: 48 }, (_, i) => {
    const day = 3 + Math.floor(i / 24);
    const hour = String(i % 24).padStart(2, '0');
    return `2026-11-${String(day).padStart(2, '0')}T${hour}:00`;
  });
  const dailyTimes = Array.from({ length: 8 }, (_, i) => `2026-11-${String(3 + i).padStart(2, '0')}`);
  return {
    timezone: 'Asia/Colombo',
    current: {
      time: '2026-11-03T14:15',
      temperature_2m: 30.2,
      relative_humidity_2m: 72,
      apparent_temperature: 35.1,
      precipitation: 0.4,
      weather_code: 61,
      wind_speed_10m: 14.5,
      wind_direction_10m: 225,
      is_day: 1,
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map((_, i) => 20 + (i % 24)),
      weather_code: hourlyTimes.map(() => 3),
      precipitation_probability: hourlyTimes.map((_, i) => (i === 20 ? null : 10)),
      precipitation: hourlyTimes.map(() => 0),
    },
    daily: {
      time: dailyTimes,
      weather_code: dailyTimes.map(() => 2),
      temperature_2m_max: dailyTimes.map(() => 31),
      temperature_2m_min: dailyTimes.map(() => 24),
      precipitation_sum: dailyTimes.map(() => 1.2),
      precipitation_probability_max: dailyTimes.map(() => 40),
      sunrise: dailyTimes.map((d) => `${d}T05:57`),
      sunset: dailyTimes.map((d) => `${d}T17:55`),
    },
  };
}

describe('mapOpenMeteoResponse', () => {
  it('maps current conditions to the domain model', () => {
    const bundle = mapOpenMeteoResponse(fixture(), colombo, '2026-11-03T14:30', 1000);
    expect(bundle.current).toMatchObject({
      temperatureC: 30.2,
      feelsLikeC: 35.1,
      humidityPct: 72,
      windSpeedKmh: 14.5,
      windDirectionDeg: 225,
      weatherCode: 61,
      isDay: true,
    });
    expect(bundle.source).toBe('open-meteo');
    expect(bundle.fetchedAt).toBe(1000);
  });

  it('starts the 24h hourly window at the current local hour', () => {
    const bundle = mapOpenMeteoResponse(fixture(), colombo, '2026-11-03T14:30');
    expect(bundle.hourly).toHaveLength(24);
    expect(bundle.hourly[0].time).toBe('2026-11-03T14:00');
    expect(bundle.hourly[23].time).toBe('2026-11-04T13:00');
  });

  it('keeps null precipitation probability as null', () => {
    const bundle = mapOpenMeteoResponse(fixture(), colombo, '2026-11-03T00:00');
    expect(bundle.hourly[20].precipitationProbabilityPct).toBeNull();
    expect(bundle.hourly[0].precipitationProbabilityPct).toBe(10);
  });

  it('limits the daily forecast to 7 days', () => {
    const bundle = mapOpenMeteoResponse(fixture(), colombo, '2026-11-03T00:00');
    expect(bundle.daily).toHaveLength(7);
    expect(bundle.daily[0]).toMatchObject({ date: '2026-11-03', temperatureMaxC: 31, temperatureMinC: 24 });
  });
});

describe('buildOpenMeteoUrl', () => {
  it('requests Asia/Colombo time and the expected variables', () => {
    const url = new URL(buildOpenMeteoUrl(colombo));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('timezone')).toBe('Asia/Colombo');
    expect(url.searchParams.get('forecast_days')).toBe('7');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(url.searchParams.get('current')).toContain('weather_code');
    expect(url.searchParams.get('hourly')).toContain('precipitation_probability');
  });
});
