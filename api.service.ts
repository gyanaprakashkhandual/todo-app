import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, TOKEN_KEY } from '../configs/config';
import type { ApiResponse } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = await this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const query = Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (query) url += `?${query}`;
    }
    const headers = await this.getHeaders();
    const res = await fetch(url, { method: 'GET', headers });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async post<T>(endpoint: string, body: unknown, auth = true): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(auth);
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (res.status === 204) return { success: true, message: 'Deleted' } as ApiResponse<T>;
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }
}

export const apiClient = new ApiClient();