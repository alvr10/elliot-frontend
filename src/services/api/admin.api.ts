/**
 * Admin API Client
 * Elliot Frontend Application
 *
 * Administrative endpoints for system statistics and management
 */

import {
  AdminStatsResponse,
  ErrorResponse,
  RevenueStatsResponse,
  SignupResponse,
  SubscriptionStatsResponse,
  UserStatsResponse,
} from '../../types/api';
import apiClientInstance from './config';

/**
 * Admin API Service
 */
class AdminApi {
  /**
   * GET /admin/stats
   * Get all admin statistics
   *
   * Requires: Bearer token with admin privileges
   *
   * @returns AdminStatsResponse with all statistics
   * @throws ErrorResponse on unauthorized
   */
  async getStats(): Promise<AdminStatsResponse> {
    try {
      const response = await apiClientInstance.get<AdminStatsResponse>('/admin/stats');
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /admin/users
   * Get user statistics
   *
   * Requires: Bearer token with admin privileges
   *
   * @returns UserStatsResponse with user statistics
   * @throws ErrorResponse on unauthorized
   */
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await apiClientInstance.get<UserStatsResponse>('/admin/users');
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /admin/subscriptions
   * Get subscription statistics
   *
   * Requires: Bearer token with admin privileges
   *
   * @returns SubscriptionStatsResponse with subscription statistics
   * @throws ErrorResponse on unauthorized
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsResponse> {
    try {
      const response = await apiClientInstance.get<SubscriptionStatsResponse>('/admin/subscriptions');
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /admin/revenue
   * Get revenue statistics
   *
   * Requires: Bearer token with admin privileges
   *
   * @returns RevenueStatsResponse with revenue statistics
   * @throws ErrorResponse on unauthorized
   */
  async getRevenueStats(): Promise<RevenueStatsResponse> {
    try {
      const response = await apiClientInstance.get<RevenueStatsResponse>('/admin/revenue');
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /admin/signups
   * Get recent signups
   *
   * Requires: Bearer token with admin privileges
   *
   * @param days - Number of days to look back (optional)
   * @returns Array of SignupResponse
   * @throws ErrorResponse on unauthorized
   */
  async getRecentSignups(days?: number): Promise<SignupResponse[]> {
    try {
      const params = days ? { days: days.toString() } : {};
      const response = await apiClientInstance.get<SignupResponse[]>('/admin/signups', { params });
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
export default adminApi;