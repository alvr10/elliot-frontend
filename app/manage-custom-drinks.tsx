import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "../src/hooks/UseAuthContext";
import ManageCustomDrinksScreen from "../src/screens/manage-custom-drinks-screen";

export default function ManageCustomDrinksPage() {
  const { user, subscription, loading, subscriptionLoading } = useAuth();

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

  // Redirect to beta access if user is not authenticated or doesn't have active subscription
  if (!user || !hasActiveSubscription) {
    return <Redirect href="/beta-access" />;
  }

  return <ManageCustomDrinksScreen />;
}
