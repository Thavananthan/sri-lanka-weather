/** Provider-agnostic domain model. Providers map their responses into these shapes. */

export interface Location {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  /** True for the device's GPS position. */
  isCurrentLocation?: boolean;
}

export interface CurrentConditions {
  /** Local wall-clock time in Asia/Colombo, "YYYY-MM-DDTHH:mm". */
  time: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyPoint {
  time: string;
  temperatureC: number;
  weatherCode: number;
  precipitationProbabilityPct: number | null;
  precipitationMm: number;
}

export interface DailyPoint {
  /** "YYYY-MM-DD" in Asia/Colombo. */
  date: string;
  weatherCode: number;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  precipitationProbabilityMaxPct: number | null;
  sunrise: string;
  sunset: string;
}

export interface WeatherBundle {
  location: Location;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  timezone: string;
  /** Provider id that produced this data, e.g. "open-meteo". */
  source: string;
  fetchedAt: number;
}
