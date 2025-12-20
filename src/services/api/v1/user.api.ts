/**
 * User API Client
 * Elliot Frontend Application
 *
 * User account management endpoints
 */

import {
  ErrorResponse,
  SuccessResponse,
} from "../../../types/api";
import apiClientInstance from "../config";


/**
 * User API Service
 */
class UserApi {
  /**
   * DELETE /user/account
   * Delete user account and all associated data
   *
   * Requires: Bearer token
   *
   * @returns SuccessResponse confirming deletion
   * @throws ErrorResponse on unauthorized or failure
   */
  async deleteAccount(): Promise<SuccessResponse> {
    try {
      // The backend expects a simple DELETE to /api/v1/user/account
      // with the Bearer token in the Authorization header
      console.log("Deleting user account");

      const response = await apiClientInstance.delete<SuccessResponse>(
        "/api/v1/user/account"
      );
      return response.data;
    } catch (error) {
      throw error as ErrorResponse;
    }
  }
}

// Export singleton instance
export const userApi = new UserApi();
export default userApi;