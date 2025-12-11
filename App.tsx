import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { SubscriptionProvider } from "./src/context/SubscriptionContext";

// Screens
import AddIntakeScreen from "./src/screens/AddIntakeScreen";
import CustomDrinkScreen from "./src/screens/CustomDrinkScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoadingScreen from "./src/screens/LoadingScreen";
import ManageCustomDrinksScreen from "./src/screens/ManageCustomDrinksScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, subscription, loading, subscriptionLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Add a listener for storage changes to detect when onboarding is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      if (hasSeenOnboarding === false) {
        const seen = await AsyncStorage.getItem("hasSeenOnboarding");
        if (seen === "true") {
          setHasSeenOnboarding(true);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [hasSeenOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setHasSeenOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Show loading screen while checking onboarding, auth, or subscription status
  if (checkingOnboarding || hasSeenOnboarding === null) {
    return <LoadingScreen />;
  }

  // Show loading while auth is loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Show loading while user exists but subscription is still being fetched
  if (user && subscriptionLoading) {
    return <LoadingScreen />;
  }

  // Check for both active and active_until_period_end
  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "active_until_period_end";

  console.log("Navigation decision:", {
    hasSeenOnboarding,
    user: user ? "exists" : "none",
    subscriptionStatus: subscription?.status || "unknown",
    hasActiveSubscription,
    loading,
    subscriptionLoading,
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          // Onboarding flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user || !hasActiveSubscription ? (
          // Payment/Auth flow - only shown after we've confirmed subscription status
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          // Main app flow
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddIntake" component={AddIntakeScreen} />
            <Stack.Screen name="CustomDrink" component={CustomDrinkScreen} />
            <Stack.Screen
              name="ManageCustomDrinks"
              component={ManageCustomDrinksScreen}
            />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <AuthProvider>
        <SubscriptionProvider>
          <NotificationProvider>
            <StatusBar style="light" backgroundColor="#000000" />
            <AppNavigator />
          </NotificationProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
