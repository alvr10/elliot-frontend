import { useAuth } from "@/hooks";
import { Redirect } from "expo-router";
import React from "react";

export default function IndexPage() {
  const { user, subscription, loading, subscriptionLoading } = useAuth();

  // Show loading while auth is loading
  if (loading) {
    return <Redirect href="/loading" />;
  }

  // Show loading while user exists but subscription is still being fetched
  if (user && subscriptionLoading) {
    return <Redirect href="/loading" />;
  }

  // Check for both active and active_until_period_end
  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "active_until_period_end";

  // Redirect to beta access if user is not authenticated or doesn't have active subscription
  if (!user || !hasActiveSubscription) {
    return <Redirect href="/beta-access" />;
  }

  // Redirect to history if user is authenticated and has active subscription
  return <Redirect href="/(tabs)/history" />;
}
