import { API_BASE_URL } from '@/lib/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

// Enable verbose logging via .env EXPO_PUBLIC_ENABLE_API_DEBUG=true
const enableDebug = process.env.EXPO_PUBLIC_ENABLE_API_DEBUG === 'true';

export interface LastApiErrorInfo {
  url?: string;
  method?: string;
  status?: number;
  code?: string;
  message?: string;
  timestamp?: number;
}

let lastError: LastApiErrorInfo | null = null;
let lastRequest: { url?: string; method?: string; timestamp?: number } | null = null;

export function getLastApiError(): LastApiErrorInfo | null {
  return lastError;
}

export function clearLastApiError() { lastError = null; }
export function getLastApiRequest() { return lastRequest; }

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  instance.interceptors.request.use((config) => {
    if (enableDebug) {
      console.log('[API][REQ]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
    }
    lastRequest = {
      url: `${config.baseURL || ''}${config.url || ''}`,
      method: (config.method || 'GET').toUpperCase(),
      timestamp: Date.now(),
    };
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      if (enableDebug) {
        console.log('[API][RES]', response.status, `${response.config.baseURL || ''}${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => {
      const cfg = error.config || {};
      const fullUrl = `${cfg.baseURL || ''}${cfg.url || ''}`;
      const status = error.response?.status;
      const enrichedMessage = `[API ERROR] ${(cfg.method || 'GET').toUpperCase()} ${fullUrl} :: ${error.message}`;
      // Mutate the error message so catch blocks see the URL.
      (error as any).message = enrichedMessage;
      lastError = {
        url: fullUrl,
        method: (cfg.method || 'GET').toUpperCase(),
        status,
        code: (error as any).code,
        message: enrichedMessage,
        timestamp: Date.now(),
      };
      if (enableDebug) {
        console.log('[API][ERR]', lastError);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const apiClient = createApiClient();