export const TIMEZONE = 'Asia/Colombo';

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Converts a bearing in degrees to a 16-point compass label. */
export function windDirectionLabel(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 22.5) % 16];
}

/** Current wall-clock time in Asia/Colombo as "YYYY-MM-DDTHH:mm", matching Open-Meteo's format. */
export function nowInColomboKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** "2026-11-03T14:00" -> "14:00". Open-Meteo returns times already in the requested zone, so no Date parsing is needed. */
export function formatHour(isoLocal: string): string {
  return isoLocal.slice(11, 16);
}

/** "2026-11-03" -> "Tue" (or "Today" when it matches the current Colombo date). */
export function formatDayName(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Today';
  const date = new Date(`${dateKey}T12:00:00+05:30`);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: TIMEZONE }).format(date);
}

export function formatTemp(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatPct(value: number | null): string {
  return value == null ? '—' : `${Math.round(value)}%`;
}

export function formatMm(value: number): string {
  return `${value.toFixed(1)} mm`;
}

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} h ago`;
}
