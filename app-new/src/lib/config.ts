// Centralized backend URL configuration.
// Change via `.env` using EXPO_PUBLIC_API_BASE_URL to affect the entire app.

const RAW_API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || 'http:///10.178.168.178:3000';

// Normalize by removing any trailing slashes
export const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, '');

// Helper to build endpoint URLs safely
export function apiUrl(path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${p}`;
}
