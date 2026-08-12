import { Platform } from 'react-native';
import { getStorageItem, setStorageItem, deleteStorageItem } from './storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export class ApiClientError extends Error {
  status: number;
  data: ApiError;

  constructor(status: number, data: ApiError) {
    super(data.message || `API Request failed with status ${status}`);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

export const TOKEN_KEY = 'wimakit_access_token';
export const REFRESH_TOKEN_KEY = 'wimakit_refresh_token';
export const USER_KEY = 'wimakit_user_data';
export const ONBOARDING_COMPLETED_KEY = 'wimakit_onboarding_completed';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach JWT Bearer Token if stored
  const token = await getStorageItem(TOKEN_KEY);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // Handle Token Refresh on 401 Unauthorized
  if (response.status === 401) {
    const refreshToken = await getStorageItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          await setStorageItem(TOKEN_KEY, refreshData.accessToken);
          if (refreshData.refreshToken) {
            await setStorageItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
          }

          // Retry original request with new token
          headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
          response = await fetch(url, { ...options, headers });
        } else {
          await deleteStorageItem(TOKEN_KEY);
          await deleteStorageItem(REFRESH_TOKEN_KEY);
          await deleteStorageItem(USER_KEY);
        }
      } catch {
        await deleteStorageItem(TOKEN_KEY);
        await deleteStorageItem(REFRESH_TOKEN_KEY);
        await deleteStorageItem(USER_KEY);
      }
    }
  }

  if (!response.ok) {
    let errorData: ApiError = { message: 'An unexpected error occurred.' };
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || `HTTP Error ${response.status}` };
    }
    throw new ApiClientError(response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return (await response.text()) as unknown as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
