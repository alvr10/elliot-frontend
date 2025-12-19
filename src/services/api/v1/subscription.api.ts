/**
 * Subscription API Client
 * Elliot Frontend Application
 *
 * Subscription management endpoints
 */

import {
  CreateSubscriptionDto,
  ErrorResponse,
  SubscriptionResponse,
  SubscriptionStatusResponse,
  SuccessResponse,
} from "../../../types/api";
import apiClientInstance from "../config";

/**
 * Subscription API Service
 */
class SubscriptionApi {
  /**
   * POST /subscription/
   * Create a new subscription
   *
   * Requires: Bearer token
   *
   * @param data - Subscription creation data
   * @returns SubscriptionResponse with subscription details
   * @throws ErrorResponse on invalid data or unauthorized
   */
  async createSubscription(
    data: CreateSubscriptionDto
  ): Promise<SubscriptionResponse> {
    try {
      const response = await apiClientInstance.post<SubscriptionResponse>(
        "/api/v1/subscription",
        data
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * POST /subscription/cancel
   * Cancel user's subscription
   *
   * Requires: Bearer token
   *
   * @returns SuccessResponse with confirmation
   * @throws ErrorResponse on unauthorized
   */
  async cancelSubscription(): Promise<SuccessResponse> {
    try {
      const response = await apiClientInstance.post<SuccessResponse>(
        "/api/v1/subscription/cancel"
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /subscription/status
   * Get subscription status
   *
   * Requires: Bearer token
   *
   * @returns SubscriptionStatusResponse with status details
   * @throws ErrorResponse on unauthorized
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    try {
      const response = await apiClientInstance.get<SubscriptionStatusResponse>(
        "/api/v1/subscription/status"
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }
}

// Export singleton instance
export const subscriptionApi = new SubscriptionApi();
export default subscriptionApi;
