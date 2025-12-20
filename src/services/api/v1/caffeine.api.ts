/**
 * Caffeine API Client
 * Elliot Frontend Application
 *
 * Caffeine intake tracking endpoints
 */

import {
  DailyLimitResponse,
  Drink,
  ErrorResponse,
  IntakeLogResponse,
  LogIntakeDto,
  UpdateDailyLimitDto,
  UpdateDailyLimitResponse,
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

      // Handle the new response format which has logs nested in the response
      if (response.data && response.data.logs) {
        // Transform the logs to match the expected IntakeLogResponse format
        return response.data.logs.map((log: any) => ({
          id: log.id,
          drinkId: log.drink_id,
          servings: log.servings,
          consumedAt: log.consumed_at,
          caffeineMg: log.total_caffeine, // Map total_caffeine to caffeineMg
          drink: log.drink // Include the nested drink object with details
        }));
      }

      // Fallback to the old format handling
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
        "/api/v1/caffeine/daily-limit",
        {
          params: { _t: Date.now() }
        }
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * PUT /caffeine/daily-limit
   * Update user's daily caffeine limit
   *
   * Requires: Bearer token
   *
   * @param data - Daily limit data
   * @returns UpdateDailyLimitResponse with updated limit
   * @throws ErrorResponse on invalid data or unauthorized
   */
  async updateDailyLimit(data: UpdateDailyLimitDto): Promise<UpdateDailyLimitResponse> {
    try {
      const response = await apiClientInstance.put<UpdateDailyLimitResponse>(
        "/api/v1/caffeine/daily-limit",
        data
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }

  /**
   * GET /caffeine/drinks
   * Get all available drinks
   *
   * Requires: Bearer token
   *
   * @returns Array of Drink objects
   * @throws ErrorResponse on unauthorized
   */
  async getDrinks(): Promise<Drink[]> {
    try {
      const response = await apiClientInstance.get<Drink[]>(
        "/api/v1/caffeine/drinks"
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
