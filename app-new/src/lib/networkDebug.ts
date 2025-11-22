// Global fetch debugging utility.
// Enable by setting EXPO_PUBLIC_ENABLE_FETCH_DEBUG=true in .env
// Captures request, response, and error details.

interface FetchAttempt {
  url: string;
  method: string;
  status?: number;
  error?: string;
  timestamp: number;
}

let lastFetchAttempt: FetchAttempt | null = null;
let initialized = false;

export function getLastFetchAttempt(): FetchAttempt | null {
  return lastFetchAttempt;
}

export function initFetchDebug() {
  if (initialized) return; // prevent re-wrapping
  initialized = true;
  const enable = process.env.EXPO_PUBLIC_ENABLE_FETCH_DEBUG === 'true';
  if (!enable) return; // do nothing if disabled

  const originalFetch = globalThis.fetch;
  if (!originalFetch) return;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url || String(input);
    const method = (init?.method || 'GET').toUpperCase();
    const startTs = Date.now();
    console.log(`[FETCH][REQ] ${method} ${url}`);
    try {
      const response = await originalFetch(input, init);
      console.log(`[FETCH][RES] ${method} ${url} ${response.status}`);
      lastFetchAttempt = { url, method, status: response.status, timestamp: startTs };
      return response;
    } catch (err: any) {
      const msg = err?.message || 'Unknown fetch error';
      console.log(`[FETCH][ERR] ${method} ${url} :: ${msg}`);
      lastFetchAttempt = { url, method, error: msg, timestamp: startTs };
      throw err;
    }
  };
}