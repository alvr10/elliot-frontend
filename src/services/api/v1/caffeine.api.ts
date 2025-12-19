/**
 * Caffeine API Client
 * Elliot Frontend Application
 *
 * Caffeine intake tracking endpoints
 */

import {
  DailyLimitResponse,
  ErrorResponse,
  IntakeLogResponse,
  LogIntakeDto,
} from "../../../types/api";
import apiClientInstance from "../config";

/**
 * Caffeine API Service
 */
class CaffeineApi {
  /**
   * POST /caffeine/log-intake
   * Log caffeine intake
   *
   * Requires: Bearer token
   *
   * @param data - Intake log data
   * @returns IntakeLogResponse with logged intake
   * @throws ErrorResponse on invalid data or unauthorized
   */
  async logIntake(data: LogIntakeDto): Promise<IntakeLogResponse> {
    try {
      const response = await apiClientInstance.post<IntakeLogResponse>(
        "/api/v1/caffeine/log-intake",
        data
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /caffeine/intake
   * Get caffeine intake history
   *
   * Requires: Bearer token
   *
   * @param period - Time period (optional)
   * @param date - Specific date (optional)
   * @returns Array of IntakeLogResponse
   * @throws ErrorResponse on unauthorized
   */
  async getIntakeHistory(
    period?: string,
    date?: string
  ): Promise<IntakeLogResponse[]> {
    try {
      const params: any = {};
      if (period) params.period = period;
      if (date) params.date = date;
      const response = await apiClientInstance.get("/api/v1/caffeine/intake", {
        params,
      });
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /caffeine/daily-limit
   * Get user's daily caffeine limit
   *
   * Requires: Bearer token
   *
   * @returns DailyLimitResponse with limits
   * @throws ErrorResponse on unauthorized
   */
  async getDailyLimit(): Promise<DailyLimitResponse> {
    try {
      const response = await apiClientInstance.get<DailyLimitResponse>(
        "/api/v1/caffeine/daily-limit"
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }
}

// Export singleton instance
export const caffeineApi = new CaffeineApi();
export default caffeineApi;
