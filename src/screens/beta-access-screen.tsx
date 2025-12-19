import { AuthStep, LandingStep } from "@/components";
import { Colors, Spacing, Typography } from "@/constants";
import { useNotification, useSubscription } from "@/context";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const router = useRouter();
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
    } catch (error: any) {
      console.error("Failed to setup beta access:", error);

      // Force redirect to sign-in page on 401 error
      if (error?.response?.status === 401) {
        showNotification(
          "Authentication error. Redirecting to sign-in...",
          "error"
        );
        router.replace("/auth/sign-in");
        return;
      }

      // Navigate back to landing page on other errors
      setCurrentStep("landing");
      showNotification(
        "Error setting up beta access. Please try again.",
        "error"
      );
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

  const handleAuth = async (email: string, name: string, mode: AuthMode) => {
    if (!email) {
      showNotification("Por favor ingresa tu correo electrónico", "error");
      return;
    }

    if ((mode === "signup" && !name) || name.trim().length < 2) {
      showNotification("Por favor ingresa tu nombre completo", "error");
      return;
    }

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, name);
      } else {
        await signInWithEmail(email);
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
