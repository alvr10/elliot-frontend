/**
 * Authentication API Client
 * Elliot Frontend Application
 *
 * All endpoints follow the OpenAPI contract specification
 */

import {
  AuthResponse,
  ErrorResponse,
  LoginDto,
  RegisterDto,
} from '../../../types/api';
import apiClientInstance from '../config';

/**
 * Authentication API Service
 */
class AuthApi {
  /**
   * GET /auth/google
   * Initiate Google OAuth login
   *
   * @returns Redirect URL for Google OAuth
   * @throws ErrorResponse on error
   */
  async initiateGoogleOAuth(): Promise<{ url: string }> {
    try {
      const response = await apiClientInstance.get<{ url: string }>('/api/v1/auth/google');
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /auth/callback
   * Handle Google OAuth callback
   *
   * @param code - Authorization code from Google
   * @returns AuthResponse with user and session
   * @throws ErrorResponse on invalid code
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await apiClientInstance.get<AuthResponse>(`/api/v1/auth/callback?code=${code}`);
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * POST /auth/register
   * Register a new user
   *
   * @param data - Registration data
   * @returns AuthResponse with tokens and user profile
   * @throws ErrorResponse on validation or conflict errors
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiClientInstance.post<AuthResponse>('/api/v1/auth/register', data);
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * POST /auth/login
   * Login user with email and password
   *
   * @param data - Login credentials
   * @returns AuthResponse with tokens and user profile
   * @throws ErrorResponse on invalid credentials
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClientInstance.post<AuthResponse>('/api/v1/auth/login', data);
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }
}

// Export singleton instance
export const authApi = new AuthApi();
export default authApi;