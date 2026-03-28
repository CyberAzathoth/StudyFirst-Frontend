// ============================================================================
// API Client - Base HTTP client with auth handling
// ============================================================================

import { API_CONFIG, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './config';
import type { ApiError, ApiResponse } from '../types';

export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get the current access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Get the current refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Set tokens in localStorage
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  /**
   * Clear all auth tokens
   */
  public clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Build headers with authorization
   */
private buildHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    // Cast to any or Record<string, string> to allow indexing
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token) {
      // This will no longer be red
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers as HeadersInit;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, statusCode?: number): never {
    const apiError: ApiError = {
      success: false,
      error: error.error || 'API_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: statusCode || error.statusCode || 500,
      details: error.details,
    };

    throw apiError;
  }

  /**
   * Make HTTP request with timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: this.buildHeaders(options.headers),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        this.handleError(data, response.status);
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        this.handleError(
          { error: 'TIMEOUT', message: 'Request timed out' },
          408
        );
      }

      if (error.success === false) {
        throw error; // Already formatted ApiError
      }

      this.handleError(
        { error: 'NETWORK_ERROR', message: error.message || 'Network error occurred' },
        0
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
