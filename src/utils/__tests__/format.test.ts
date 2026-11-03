import { describe, expect, it } from 'vitest';
import { formatDayName, formatHour, formatRelativeTime, nowInColomboKey, windDirectionLabel } from '../format';
import { describeWeatherCode } from '../weatherCodes';

describe('windDirectionLabel', () => {
  it.each([
    [0, 'N'],
    [90, 'E'],
    [180, 'S'],
    [225, 'SW'],
    [359, 'N'],
    [360, 'N'],
    [-90, 'W'],
  ])('maps %i° to %s', (deg, label) => {
    expect(windDirectionLabel(deg)).toBe(label);
  });
});

describe('time helpers', () => {
  it('formats the hour portion of a local ISO string', () => {
    expect(formatHour('2026-11-03T07:00')).toBe('07:00');
  });

  it('returns Colombo wall-clock time in Open-Meteo key format', () => {
    // 2026-11-03T00:00:00Z is 05:30 in Asia/Colombo.
    expect(nowInColomboKey(new Date('2026-11-03T00:00:00Z'))).toBe('2026-11-03T05:30');
  });

  it('labels today and other weekdays', () => {
    expect(formatDayName('2026-11-03', '2026-11-03')).toBe('Today');
    expect(formatDayName('2026-11-04', '2026-11-03')).toBe('Wed');
  });

  it('formats relative update times', () => {
    const now = 10_000_000;
    expect(formatRelativeTime(now - 20_000, now)).toBe('just now');
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5 min ago');
    expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe('2 h ago');
  });
});

describe('describeWeatherCode', () => {
  it('uses night emoji for clear sky at night', () => {
    expect(describeWeatherCode(0, false).emoji).toBe('🌙');
    expect(describeWeatherCode(0, true).emoji).toBe('☀️');
  });

  it('falls back to unknown for unmapped codes', () => {
    expect(describeWeatherCode(999).label).toBe('Unknown');
  });
});
