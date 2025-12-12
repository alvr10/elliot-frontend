/**
 * API Configuration
 * Elliot Frontend Application
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ErrorResponse } from '../../types';

// API Base URL - Can be configured via environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.elliot-cafe.com/api';

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
      timeout: 60000,
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
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        console.error(`❌ API Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
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
   * Get the axios instance
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient().getInstance();
export default apiClient;