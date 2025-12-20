/**
 * API Configuration
 * Elliot Frontend Application
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ErrorResponse } from "../../types";

// API Base URL - Can be configured via environment variables
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.elliot-cafe.com";

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@elliot/access_token",
  REFRESH_TOKEN: "@elliot/refresh_token",
  USER_PROFILE: "@elliot/user_profile",
  USER_PROFILE_IMAGE: "@elliot/user_profile_image",
} as const;

/**
 * API Client Configuration
 */
class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;
  // eslint-disable-next-line import/no-named-as-default-member
  private requestCancelTokenSource = axios.CancelToken.source();
  private isRefreshing = false;
  private failedQueue: {
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }[] = [];

  constructor() {
    // Log API configuration on startup
    console.log("🚀 API Client initialized");
    console.log("📡 Base URL:", API_BASE_URL);

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        "X-Platform": "mobile",
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
      async config => {
        const token = await this.getAccessToken();
        const hasToken = !!token;

        console.log(
          `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            hasAuth: hasToken,
            baseURL: config.baseURL,
          }
        );

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        console.error("❌ Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      response => {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();

            // Update the authorization header for the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            // Process all queued requests
            this.failedQueue.forEach(({ resolve }) => resolve(newToken));
            this.failedQueue = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, reject all queued requests
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            // Clear tokens on refresh failure
            await this.clearTokens();

            // Dispatch custom event for auth failure
            this.dispatchAuthFailure();

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

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
      console.error("Error getting access token:", error);
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
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Refresh Access Token using Refresh Token
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Import supabase here to avoid circular dependencies
        const { supabase } = await import("../../lib/supabase");

        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error refreshing token:", error);
          throw error;
        }

        if (!data.session) {
          throw new Error("No session returned from refresh");
        }

        const { access_token, refresh_token: newRefreshToken } = data.session;

        // Store the new tokens
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        console.log("✅ Token refreshed successfully");
        return access_token;
      } catch (error) {
        console.error("❌ Failed to refresh token:", error);
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);
      console.log("🗑️ Tokens cleared");
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Dispatch auth failure event for global handling
   */
  private dispatchAuthFailure(): void {
    // This event can be listened to by the auth provider
    // to handle global logout
    console.log("🚨 Auth failure detected");
    // Using a simple approach - in a real app, you might use an event emitter
    setTimeout(() => {
      // This will trigger a sign out in the auth provider
      window.dispatchEvent?.(new CustomEvent('auth:failure'));
    }, 0);
  }

  /**
   * Get the axios instance
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Public method to manually refresh tokens
   */
  public async refreshTokens(): Promise<string> {
    return this.refreshAccessToken();
  }
}

// Export singleton instance and class
export const apiClient = new ApiClient().getInstance();
export { ApiClient };
export default apiClient;
