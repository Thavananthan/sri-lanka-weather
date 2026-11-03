import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCATIONS } from '../../../config/constants';
import type { WeatherBundle } from '../../../types/weather';
import { withFallback } from '../fallback';
import type { WeatherProvider } from '../types';

const location = DEFAULT_LOCATIONS[0];
const bundle = (source: string) => ({ source }) as unknown as WeatherBundle;

function provider(id: string, impl: WeatherProvider['getForecast']): WeatherProvider {
  return { id, getForecast: vi.fn(impl) };
}

describe('withFallback', () => {
  it('returns the first provider result without calling later providers', async () => {
    const primary = provider('a', async () => bundle('a'));
    const backup = provider('b', async () => bundle('b'));
    const chain = withFallback([primary, backup]);

    await expect(chain.getForecast(location)).resolves.toMatchObject({ source: 'a' });
    expect(backup.getForecast).not.toHaveBeenCalled();
  });

  it('falls through to the next provider when one fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chain = withFallback([
      provider('a', async () => {
        throw new Error('down');
      }),
      provider('b', async () => bundle('b')),
    ]);

    await expect(chain.getForecast(location)).resolves.toMatchObject({ source: 'b' });
  });

  it('throws the last error when every provider fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chain = withFallback([
      provider('a', async () => {
        throw new Error('first');
      }),
      provider('b', async () => {
        throw new Error('second');
      }),
    ]);

    await expect(chain.getForecast(location)).rejects.toThrow('second');
  });

  it('does not fall through when the request was aborted', async () => {
    const controller = new AbortController();
    const backup = provider('b', async () => bundle('b'));
    const chain = withFallback([
      provider('a', async () => {
        controller.abort();
        throw new DOMException('aborted', 'AbortError');
      }),
      backup,
    ]);

    await expect(chain.getForecast(location, controller.signal)).rejects.toThrow('aborted');
    expect(backup.getForecast).not.toHaveBeenCalled();
  });
});
