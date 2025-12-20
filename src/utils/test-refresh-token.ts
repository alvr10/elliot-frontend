/**
 * Test utility to verify refresh token implementation
 * This file can be used to test the refresh token functionality
 */

import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/services/api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Test function to verify refresh token storage and retrieval
 */
export async function testRefreshTokenStorage() {
  console.log("🧪 Testing refresh token storage...");

  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Error getting session:", error);
      return false;
    }

    if (!session) {
      console.log("ℹ️ No active session found");
      return false;
    }

    // Check if refresh token exists in Supabase session
    if (!session.refresh_token) {
      console.log("⚠️ No refresh token in Supabase session");
      return false;
    }

    console.log("✅ Refresh token exists in Supabase session");

    // Check if tokens are stored in AsyncStorage
    const storedAccessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!storedAccessToken) {
      console.log("❌ Access token not stored in AsyncStorage");
      return false;
    }

    if (!storedRefreshToken) {
      console.log("❌ Refresh token not stored in AsyncStorage");
      return false;
    }

    console.log("✅ Tokens properly stored in AsyncStorage");

    // Verify tokens match
    if (storedAccessToken !== session.access_token) {
      console.log("❌ Stored access token doesn't match session token");
      return false;
    }

    if (storedRefreshToken !== session.refresh_token) {
      console.log("❌ Stored refresh token doesn't match session token");
      return false;
    }

    console.log("✅ Stored tokens match session tokens");
    console.log("✅ Refresh token implementation is working correctly!");

    return true;
  } catch (error) {
    console.error("❌ Error testing refresh token:", error);
    return false;
  }
}

/**
 * Test function to verify token refresh mechanism
 */
export async function testTokenRefresh() {
  console.log("🔄 Testing token refresh mechanism...");

  try {
    // Import API client to test refresh
    const { ApiClient } = await import("@/services/api/config");
    const apiClientInstance = new ApiClient();

    // Get current token
    const initialToken = await apiClientInstance.refreshTokens();

    if (!initialToken) {
      console.log("❌ Failed to get initial token");
      return false;
    }

    console.log("✅ Successfully refreshed token");

    // Verify token was updated in storage
    const newStoredToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!newStoredToken) {
      console.log("❌ Token not updated in storage after refresh");
      return false;
    }

    console.log("✅ Token properly updated in storage");
    console.log("✅ Token refresh mechanism is working correctly!");

    return true;
  } catch (error) {
    console.error("❌ Error testing token refresh:", error);
    return false;
  }
}

/**
 * Run all refresh token tests
 */
export async function runRefreshTokenTests() {
  console.log("🚀 Running refresh token tests...\n");

  const storageTest = await testRefreshTokenStorage();
  console.log("");

  if (storageTest) {
    const refreshTest = await testTokenRefresh();
    console.log("");

    if (refreshTest) {
      console.log("🎉 All refresh token tests passed!");
      return true;
    }
  }

  console.log("💥 Some tests failed");
  return false;
}