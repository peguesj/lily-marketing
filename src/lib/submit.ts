/**
 * Shared submit client for the v2 conversion forms.
 *
 * Posts JSON to the Phoenix `SubmitController` (`POST /api/submit`). Contract:
 *   - honeypot `_h` non-empty -> 200 {"ok":true} (silently dropped)
 *   - missing `email`         -> 400 {"error":"Email required"}
 *   - otherwise               -> 200 {"ok":true}
 *
 * Success is only reported when the server answers 2xx with `{ok:true}`;
 * callers must never render a success state before that.
 *
 * Kept erasable-TS only (no enums / parameter properties) so node's native
 * type stripping can import it in scripts/__tests__.
 */

export const SUBMIT_ENDPOINT = '/api/submit';
export const SUBMIT_TIMEOUT_MS = 10_000;

export type SubmitErrorKind = 'network' | 'invalid' | 'server';

export type SubmitResult = { ok: true } | { ok: false; error: SubmitErrorKind };

export type SubmissionPayload = {
  type: string;
  _h?: string;
  [field: string]: unknown;
};

export interface SubmitOptions {
  endpoint?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

const fail = (error: SubmitErrorKind): SubmitResult => ({ ok: false, error });

export async function postSubmission(
  payload: SubmissionPayload,
  options: SubmitOptions = {},
): Promise<SubmitResult> {
  const { endpoint = SUBMIT_ENDPOINT, timeoutMs = SUBMIT_TIMEOUT_MS } = options;
  const doFetch = options.fetchImpl ?? globalThis.fetch;

  // `_h` (honeypot) and `type` are always present on the wire.
  const body = JSON.stringify({ ...payload, _h: payload._h ?? '', type: payload.type });

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve('timeout');
    }, timeoutMs);
  });

  try {
    const request = doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
      signal: controller.signal,
    });
    // Race so a fetch implementation that ignores the abort signal still times out.
    request.catch(() => undefined);
    const response = await Promise.race([request, timeout]);
    if (response === 'timeout') return fail('network');

    if (response.status >= 500) return fail('server');
    if (response.status >= 400) return fail('invalid');

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return fail('server');
    }
    const confirmed =
      response.ok && typeof data === 'object' && data !== null && (data as { ok?: unknown }).ok === true;
    return confirmed ? { ok: true } : fail('server');
  } catch {
    return fail('network');
  } finally {
    clearTimeout(timer);
  }
}
