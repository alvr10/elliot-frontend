import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthStep from "../components/AuthStep";
import LandingStep from "../components/LandingStep";
import { Colors, Spacing, Typography } from "../constants";
import { useNotification } from "../context/NotificationContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useAuth } from "../hooks/UseAuthContext";

type FlowStep = "landing" | "auth";
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

export default function BetaAccessScreen() {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    user,
    refreshSubscription,
    subscriptionLoading,
  } = useAuth();
  const { showNotification } = useNotification();
  const { createSubscription } = useSubscription();

  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [initialAuthMode, setInitialAuthMode] = useState<AuthMode>("signup");

  // Auto-progress based on user state
  useEffect(() => {
    // Don't make navigation decisions while subscription is loading
    if (subscriptionLoading) {
      console.log("Subscription loading, waiting...");
      return;
    }

    if (user) {
      console.log("User authenticated, setting up beta access");
      // Auto-create beta subscription for authenticated users
      setupBetaAccess();
      return;
    }

    if (!user && currentStep !== "landing") {
      console.log("User signed out, going back to landing");
      // User signed out - go back to landing
      setCurrentStep("landing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, subscriptionLoading]);

  const setupBetaAccess = async () => {
    try {
      console.log("Setting up beta access...");
      await createSubscription();
      await refreshSubscription();
    } catch (error) {
      console.error("Failed to setup beta access:", error);
    }
  };

  const handleStartJourney = () => {
    setInitialAuthMode("signup");
    setCurrentStep("auth");
  };

  const handleAlreadyHaveAccount = () => {
    setInitialAuthMode("signin");
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
      } else {
        await signInWithEmail(email, password);
      }
      // Beta access will be set up automatically in the useEffect
    } catch (error: any) {
      console.log("Auth error:", error);
      showNotification(error.message, "error");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      // Beta access will be set up automatically in the useEffect
    } catch (error: any) {
      console.log("Google auth error:", error);
      showNotification(
        error.message || "Error al iniciar sesión con Google",
        "error"
      );
    }
  };

  // Show loading if subscription status is being fetched for signed-in user
  if (user && subscriptionLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Configurando acceso beta...</Text>
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
          initialMode={initialAuthMode}
        />
      );
    default:
      return null;
  }
}
