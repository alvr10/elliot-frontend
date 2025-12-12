/**
 * API Configuration
 * Elliot Frontend Application
 */

import { ErrorCode, ErrorResponse } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// API Base URL - Can be configured via environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@elliot/access_token',
  REFRESH_TOKEN: '@elliot/refresh_token',
  USER_PROFILE: '@elliot/user_profile',
} as const;

/**
 * API Client Configuration
 */
class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;
  private requestCancelTokenSource = axios.CancelToken.source();

  constructor() {
    // Log API configuration on startup
    console.log('🚀 API Client initialized');
    console.log('📡 Base URL:', API_BASE_URL);

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': 'mobile',
      },
      cancelToken: this.requestCancelTokenSource.token,
    });

    this.setupInterceptors();
  }

  /**
   * Setup Request and Response Interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        const hasToken = !!token;

        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          hasAuth: hasToken,
          baseURL: config.baseURL
        });

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token &&
          config.url !== '/auth/login' &&
          config.url !== '/auth/register' &&
          config.url !== '/auth/forgot-password' &&
          config.url !== '/auth/reset-password' &&
          config.url !== '/auth/request-email-verification' &&
          config.url !== '/auth/request-sms-verification') {
          // For non-auth endpoints, if no token, cancel the request
          console.warn(`⚠️ No auth token available for ${config.url}, cancelling request`);
          const cancelSource = axios.CancelToken.source();
          config.cancelToken = cancelSource.token;
          return Promise.reject(cancelSource.cancel('No authentication token available'));
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        // Skip detailed error logging for InternalBytecode.js issues
        if (error.message.includes('InternalBytecode.js')) {
          console.warn('⚠️ Metro bundler error detected - skipping detailed logging');
          return Promise.reject(this.normalizeError(error));
        }

        console.error(`❌ API Error: ${error.message}`);
        console.error('Error details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          hasRequest: !!error.config,
          isNetworkError: !error.response,
          isTimeout: error.code === 'ECONNABORTED',
          isCancelled: axios.isCancel(error)
        });
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized and 403 Forbidden - Token expired or invalid
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Check if we still have tokens before attempting refresh
            const refreshToken = await this.getRefreshToken();
            const accessToken = await this.getAccessToken();

            if (!refreshToken || !accessToken) {
              // No tokens available, clear auth and reject
              await this.clearAuth();
              return Promise.reject(this.createNetworkError('Session expired. Please login again.'));
            }

            const newAccessToken = await this.handleTokenRefresh();

            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch {
            // Refresh failed - clear auth and redirect to login
            await this.clearAuth();
            return Promise.reject(this.createNetworkError('Session expired. Please login again.'));
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Handle Token Refresh
   */
  private async handleTokenRefresh(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await this.setAccessToken(accessToken);
        await this.setRefreshToken(newRefreshToken);

        return accessToken;
      } catch (error) {
        await this.clearAuth();
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Normalize API errors
   */
  private normalizeError(error: AxiosError<ErrorResponse>): ErrorResponse {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.code === 'ECONNABORTED') {
      return this.createNetworkError('Request timeout. Please check your connection.');
    }

    if (!error.response) {
      return this.createNetworkError('Network error. Please check your connection.');
    }

    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      },
    };
  }

  /**
   * Create network error response
   */
  private createNetworkError(message: string): ErrorResponse {
    return {
      success: false,
      error: {
        code: ErrorCode.NETWORK_ERROR,
        message,
      },
    };
  }

  /**
   * Get Access Token from storage
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get Refresh Token from storage
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Set Access Token in storage
   */
  private async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  /**
   * Set Refresh Token in storage
   */
  private async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  /**
   * Clear all auth data
   */
  private async clearAuth(): Promise<void> {
    try {
      // Cancel all pending requests
      this.requestCancelTokenSource.cancel('User logged out');

      // Create new cancel token source for future requests
      this.requestCancelTokenSource = axios.CancelToken.source();

      // Update client with new cancel token
      this.client.defaults.cancelToken = this.requestCancelTokenSource.token;

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  /**
   * Get the axios instance
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient().getInstance();
export default apiClient;