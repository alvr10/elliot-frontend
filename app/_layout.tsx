import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Linking } from "react-native";
import { SplashScreenController } from "../src/components/splash-screen-controller";
import { NotificationProvider } from "../src/context/NotificationContext";
import { SubscriptionProvider } from "../src/context/SubscriptionContext";
import { useAuth } from "../src/hooks/UseAuthContext";
import { supabase } from "../src/lib/supabase";
import AuthProvider from "../src/providers/use-auth-context";

// This is the root layout that wraps our entire app
export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <SplashScreenController />
          <StatusBar style="light" backgroundColor="#000000" />
          <RootLayoutNav />
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, subscription, loading, subscriptionLoading } = useAuth();

  // Handle OAuth deep linking
  React.useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log("Deep link received:", url);

      if (url.includes("auth")) {
        // This is an OAuth callback
        try {
          // Parse the URL to extract the session
          const urlObj = new URL(url);
          const accessToken = urlObj.searchParams.get("access_token");
          const refreshToken = urlObj.searchParams.get("refresh_token");

          if (accessToken && refreshToken) {
            // Set the session manually
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error("Error setting session from OAuth:", error);
            } else {
              console.log("OAuth session set successfully");
            }
          }
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
        }
      }
    };

    // Handle initial URL if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URLs when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Show loading while auth is loading
  if (loading) {
    return null; // We'll handle loading in the individual routes
  }

  // Show loading while user exists but subscription is still being fetched
  if (user && subscriptionLoading) {
    return null; // We'll handle loading in the individual routes
  }

  // Check for both active and active_until_period_end
  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "active_until_period_end";

  console.log("Navigation decision:", {
    user: user ? "exists" : "none",
    subscriptionStatus: subscription?.status || "unknown",
    hasActiveSubscription,
    loading,
    subscriptionLoading,
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
    >
      {!user || !hasActiveSubscription ? (
        // Beta access flow
        <Stack.Screen name="beta-access" redirect={false} />
      ) : (
        // Main app flow - these will be the initial route
        <Stack.Screen name="(tabs)" redirect={false} />
      )}
    </Stack>
  );
}
