import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthStep from "../components/AuthStep";
import LandingStep from "../components/LandingStep";
import { Colors, Spacing, Typography } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

type FlowStep = "landing" | "auth" | "subscription";
type AuthMode = "signin" | "signup";

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    marginTop: Spacing.lg,
  },
});

export default function PaywallScreen() {
  const {
    signInWithEmail,
    signUpWithEmail,
    user,
    refreshSubscription,
    subscriptionLoading,
  } = useAuth();
  const { showNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");

  // Auto-progress based on user state
  useEffect(() => {
    // Don't make navigation decisions while subscription is loading
    if (subscriptionLoading) {
      console.log("Subscription loading, waiting...");
      return;
    }

    if (user) {
      console.log("User authenticated, free access in beta");
      // User is signed in - free access in beta, App.tsx will handle redirect
      return;
    }

    if (!user && currentStep !== "landing") {
      console.log("User signed out, going back to landing");
      // User signed out - go back to landing
      setCurrentStep("landing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, subscriptionLoading]);

  const handleStartJourney = () => {
    setCurrentStep("auth");
  };

  const handleAlreadyHaveAccount = () => {
    setCurrentStep("auth");
  };

  const handleAuth = async (
    email: string,
    password: string,
    mode: AuthMode
  ) => {
    if (!email || !password) {
      showNotification(
        "Por favor ingresa tanto el correo electrónico como la contraseña",
        "error"
      );
      return;
    }

    if (mode === "signup" && password.length < 6) {
      showNotification(
        "La contraseña debe tener al menos 6 caracteres",
        "error"
      );
      return;
    }

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        // Wait for subscription status to be fetched before proceeding
        setTimeout(async () => {
          await refreshSubscription();
        }, 1000);
      } else {
        await signInWithEmail(email, password);
        // Wait for subscription status to be fetched
        setTimeout(async () => {
          await refreshSubscription();
        }, 1000);
      }
    } catch (error: any) {
      console.log("Auth error:", error);
      showNotification(error.message, "error");
    }
  };

  const handleGoogleAuth = () => {
    showNotification(
      "Google OAuth login and registration not implemented yet",
      "info"
    );
  };

  // Show loading if subscription status is being fetched for signed-in user
  if (user && subscriptionLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>
          Verificando estado de suscripción...
        </Text>
      </SafeAreaView>
    );
  }

  switch (currentStep) {
    case "landing":
      return (
        <LandingStep
          onStartJourney={handleStartJourney}
          onAlreadyHaveAccount={handleAlreadyHaveAccount}
        />
      );
    case "auth":
      return (
        <AuthStep
          onBack={() => setCurrentStep("landing")}
          onAuth={handleAuth}
          onGoogleAuth={handleGoogleAuth}
          loading={false} // AuthStep manages its own loading state
        />
      );
    default:
      return null;
  }
}
