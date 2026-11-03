import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { useAppStore } from '../store/appStore';
import { DEFAULT_LOCATIONS } from '../config/constants';
import type { OpenMeteoResponse } from '../services/weather/openMeteo';

function forecastFixture(): OpenMeteoResponse {
  const hourly = Array.from({ length: 168 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 10, 3, i));
    return `${d.toISOString().slice(0, 13)}:00`.replace('Z', '');
  });
  return {
    timezone: 'Asia/Colombo',
    current: {
      time: '2026-11-03T16:15',
      temperature_2m: 27,
      relative_humidity_2m: 80,
      apparent_temperature: 31,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 12,
      wind_direction_10m: 45,
      is_day: 1,
    },
    hourly: {
      time: hourly,
      temperature_2m: hourly.map(() => 27),
      weather_code: hourly.map(() => 1),
      precipitation_probability: hourly.map(() => 20),
      precipitation: hourly.map(() => 0),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, i) => `2026-11-${String(3 + i).padStart(2, '0')}`),
      weather_code: Array(7).fill(3),
      temperature_2m_max: Array(7).fill(31),
      temperature_2m_min: Array(7).fill(24),
      precipitation_sum: Array(7).fill(0),
      precipitation_probability_max: Array(7).fill(30),
      sunrise: Array(7).fill('2026-11-03T05:57'),
      sunset: Array(7).fill('2026-11-03T17:55'),
    },
  };
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(forecastFixture()), { status: 200 })),
  );
  localStorage.clear();
  useAppStore.setState({ favorites: [], selected: DEFAULT_LOCATIONS[0], theme: 'system' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('shows a loading skeleton, then the current conditions and forecasts', async () => {
    render(<App />);
    expect(screen.getByRole('status', { name: /loading weather/i })).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: /colombo/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Next 24 hours')).toBeInTheDocument();
    expect(screen.getByText('7-day forecast')).toBeInTheDocument();
    // 27° appears in both the current card and the hourly strip.
    expect(screen.getAllByText('27°').length).toBeGreaterThan(1);
  });

  it('requests the Asia/Colombo forecast for the selected city', async () => {
    render(<App />);
    await screen.findByText('Next 24 hours');
    const url = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(url).toContain('api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=6.9271');
    expect(url).toContain('timezone=Asia%2FColombo');
  });

  it('shows an error card when the weather service is down', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValue(new Response('nope', { status: 503 }));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/503/);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
