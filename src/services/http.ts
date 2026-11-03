import { REQUEST_TIMEOUT_MS } from '../config/constants';

export class HttpError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * fetch + JSON with a timeout. Combines the caller's AbortSignal (e.g. when the
 * user switches city) with the timeout so either one cancels the request.
 */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, { signal: combined, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new HttpError(timeout.aborted ? 'The weather service timed out.' : 'Network error. Check your connection.');
  }

  if (!response.ok) {
    throw new HttpError(`Weather service responded with ${response.status}.`, response.status);
  }
  return (await response.json()) as T;
}
