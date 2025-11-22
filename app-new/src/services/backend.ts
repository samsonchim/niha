import { apiClient, getLastApiError } from '@/lib/apiClient';
import { apiUrl } from '@/lib/config';

export async function triggerOnboarding(payload: { userId: string; email: string; fullName?: string }) {
  // Backend should:
  // 1) Create Flutterwave DVA with BVN 2211903400
  // 2) Create BlockRadar dedicated address using provided credentials (server-side)
  // 3) Store related metadata in Supabase
  const url = apiUrl('/onboarding');
  try {
    await apiClient.post(url, payload);
  } catch (e: any) {
    throw new Error(e.message || `Failed onboarding POST ${url}`);
  }
}

export async function transferFiat(payload: { userId: string; amount: number; recipientAccount: string; bankCode: string; narration?: string }) {
  const url = apiUrl('/transfer/fiat');
  try {
    const { data } = await apiClient.post(url, payload);
    return data;
  } catch (e: any) {
    throw new Error(e.message || `Failed fiat transfer POST ${url}`);
  }
}

export async function transferCrypto(payload: { userId: string; toAddress: string; amount: string; blockchain?: string }) {
  const url = apiUrl('/transfer/crypto');
  try {
    const { data } = await apiClient.post(url, payload);
    return data;
  } catch (e: any) {
    throw new Error(e.message || `Failed crypto transfer POST ${url}`);
  }
}

// Simple connectivity check to backend /health endpoint.
export async function pingBackend(): Promise<{ ok: boolean; error?: string; status?: number; url: string; lastError?: any }> {
  const url = apiUrl('/health');
  try {
    const { data, status } = await apiClient.get(url, { timeout: 5000 });
    return { ok: Boolean(data?.ok), status, url };
  } catch (e: any) {
    const le = getLastApiError();
    return { ok: false, error: e?.message || 'Ping failed', status: le?.status, url, lastError: le };
  }
}
