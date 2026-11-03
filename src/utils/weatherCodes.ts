/** WMO weather interpretation codes used by Open-Meteo. */

export interface WeatherCodeInfo {
  label: string;
  emoji: string;
  emojiNight?: string;
}

const CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', emoji: '☀️', emojiNight: '🌙' },
  1: { label: 'Mainly clear', emoji: '🌤️', emojiNight: '🌙' },
  2: { label: 'Partly cloudy', emoji: '⛅', emojiNight: '☁️' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  56: { label: 'Freezing drizzle', emoji: '🌧️' },
  57: { label: 'Freezing drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌦️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  66: { label: 'Freezing rain', emoji: '🌧️' },
  67: { label: 'Heavy freezing rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '🌨️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '❄️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌧️' },
  82: { label: 'Violent showers', emoji: '⛈️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Heavy snow showers', emoji: '❄️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm with hail', emoji: '⛈️' },
  99: { label: 'Severe thunderstorm', emoji: '⛈️' },
};

const UNKNOWN: WeatherCodeInfo = { label: 'Unknown', emoji: '❔' };

export function describeWeatherCode(code: number, isDay = true): WeatherCodeInfo {
  const info = CODES[code] ?? UNKNOWN;
  if (!isDay && info.emojiNight) return { ...info, emoji: info.emojiNight };
  return info;
}
