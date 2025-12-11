// src/screens/PaywallScreen.tsx (FIXED - Better state handling)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FlowStep = "landing" | "auth" | "subscription";
type AuthMode = "signin" | "signup";

const features = [
  "Precise caffeine tracking",
  "Custom drink database",
  "Daily limit monitoring",
  "Intake history & trends",
  "Health insights",
  "Withdrawal timeline",
  "Expert recommendations",
];

const testimonials = [
  {
    text: "I had no idea I was consuming 600mg of caffeine daily. This app literally saved my sleep.",
    author: "Sarah M.",
  },
  {
    text: "Finally broke my 10-year energy drink addiction. The tracking made me accountable.",
    author: "Mike R.",
  },
];

export default function PaywallScreen() {
  const {
    signInWithEmail,
    signUpWithEmail,
    user,
    subscription,
    refreshSubscription,
    subscriptionLoading,
  } = useAuth();
  const { createSubscription, loading: subscriptionCreationLoading } =
    useSubscription();

  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-progress based on user state
  useEffect(() => {
    // Don't make navigation decisions while subscription is loading
    if (subscriptionLoading) {
      console.log("Subscription loading, waiting...");
      return;
    }

    if (user && subscription?.status === "active") {
      console.log("User has active subscription, should redirect to app");
      // User is signed in and subscribed - App.tsx will handle redirect
      return;
    }

    if (
      user &&
      subscription?.status !== "active" &&
      subscription?.status !== "active_until_period_end"
    ) {
      console.log(
        "User signed in but no active subscription, going to subscription step"
      );
      // User signed in but not subscribed - go to subscription step
      setCurrentStep("subscription");
    } else if (!user && currentStep === "subscription") {
      console.log("User signed out, going back to auth");
      // User signed out - go back to auth
      setCurrentStep("auth");
    }
  }, [user, subscription, subscriptionLoading]);

  const handleStartJourney = () => {
    setCurrentStep("auth");
    setAuthMode("signup");
  };

  const handleAlreadyHaveAccount = () => {
    setCurrentStep("auth");
    setAuthMode("signin");
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (authMode === "signup" && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
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
      Alert.alert("Error", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const success = await createSubscription();
      if (success) {
        await refreshSubscription();
        // App.tsx will handle navigation to main app
      }
    } catch (error) {
      Alert.alert("Error", "Unable to process subscription. Please try again.");
    }
  };

  // Show loading if subscription status is being fetched for signed-in user
  if (user && subscriptionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white text-lg mt-4">
          Checking subscription status...
        </Text>
      </SafeAreaView>
    );
  }

  // STEP 1: LANDING PAGE
  if (currentStep === "landing") {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-12 pb-8">
            <Text className="text-white text-4xl font-bold text-center mb-4">
              CaffTracker Pro
            </Text>
            <Text className="text-gray-300 text-xl text-center">
              Take control of your caffeine intake
            </Text>
          </View>

          {/* Urgency Message */}
          <View className="bg-white mx-6 p-6 rounded-lg mb-8">
            <Text className="text-black text-xl font-bold text-center mb-3">
              Your Health Can't Wait
            </Text>
            <Text className="text-gray-700 text-center text-base">
              Every day without proper tracking is another day of potential
              overconsumption.
            </Text>
          </View>

          {/* Features */}
          <View className="px-6 mb-8">
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Everything You Need
            </Text>
            <View className="space-y-4">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="bg-white w-2 h-2 rounded-full mr-4" />
                  <Text className="text-gray-300 text-base flex-1">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Proof */}
          <View className="px-6 mb-8">
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Real Results
            </Text>
            <View className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <View
                  key={index}
                  className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                >
                  <Text className="text-gray-300 text-sm mb-2 italic">
                    "{testimonial.text}"
                  </Text>
                  <Text className="text-white text-xs font-semibold">
                    — {testimonial.author}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View className="mx-6 mb-8">
            <View className="bg-white p-6 rounded-lg">
              <Text className="text-black text-2xl font-bold text-center mb-2">
                €2.99/month
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Full access to all features
              </Text>
              <Text className="text-gray-700 text-sm text-center">
                Less than the cost of 3 coffees. Invest in your health.
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleStartJourney}
              className="bg-white py-4 rounded-lg mb-4"
            >
              <Text className="text-black text-lg font-bold text-center">
                Start Your Journey
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAlreadyHaveAccount}
              className="border border-gray-600 py-4 rounded-lg"
            >
              <Text className="text-white text-lg font-medium text-center">
                I Already Have an Account
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center mt-4">
              Cancel anytime. Your health is worth it.
            </Text>
          </View>

          {__DEV__ && (
            <TouchableOpacity
              onPress={async () => {
                await AsyncStorage.removeItem("hasSeenOnboarding");
                Alert.alert("Debug", "Onboarding reset! Restart the app.");
              }}
              className="bg-red-600 p-3 rounded-lg m-4"
            >
              <Text className="text-white text-center">
                DEBUG: Reset Onboarding
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // STEP 2: AUTHENTICATION
  if (currentStep === "auth") {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Progress Bar */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => setCurrentStep("landing")}>
                <Text className="text-white text-lg">← Back</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center space-x-2 mb-6">
              <View className="h-1 bg-white rounded-full flex-1" />
              <View className="h-1 bg-gray-700 rounded-full flex-1" />
            </View>
            <Text className="text-gray-400 text-center text-sm">
              Step 1 of 2:{" "}
              {authMode === "signup" ? "Create Account" : "Sign In"}
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 px-6 justify-center">
              <View className="mb-8">
                <Text className="text-white text-3xl font-bold text-center mb-4">
                  {authMode === "signup"
                    ? "Create Your Account"
                    : "Welcome Back"}
                </Text>
                <Text className="text-gray-300 text-lg text-center">
                  {authMode === "signup"
                    ? "Join thousands taking control of their caffeine intake"
                    : "Sign in to continue your journey"}
                </Text>
              </View>

              <View className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-gray-800 text-white px-4 py-4 rounded-lg mb-4 border border-gray-600 text-lg"
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    authMode === "signup"
                      ? "Password (min 6 characters)"
                      : "Password"
                  }
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  className="bg-gray-800 text-white px-4 py-4 rounded-lg mb-6 border border-gray-600 text-lg"
                />

                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={authLoading}
                  className={`py-4 rounded-lg mb-4 ${
                    authLoading ? "bg-gray-700" : "bg-white"
                  }`}
                >
                  {authLoading ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="#000" />
                      <Text className="text-black text-lg font-bold ml-2">
                        {authMode === "signup"
                          ? "Creating Account..."
                          : "Signing In..."}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-black text-lg font-bold text-center">
                      {authMode === "signup" ? "Create Account" : "Sign In"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setAuthMode(authMode === "signup" ? "signin" : "signup")
                  }
                >
                  <Text className="text-gray-400 text-center">
                    {authMode === "signup"
                      ? "Already have an account? "
                      : "Don't have an account? "}
                    <Text className="text-white font-medium">
                      {authMode === "signup" ? "Sign In" : "Sign Up"}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // STEP 3: SUBSCRIPTION
  if (currentStep === "subscription") {
    return (
      <SafeAreaView className="flex-1 bg-black">
        {/* Progress Bar */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row justify-center space-x-2 mb-6">
            <View className="h-1 bg-white rounded-full flex-1" />
            <View className="h-1 bg-white rounded-full flex-1" />
          </View>
          <Text className="text-gray-400 text-center text-sm">
            Step 2 of 2: Complete Your Subscription
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 justify-center">
            <View className="mb-8">
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Almost There!
              </Text>
              <Text className="text-gray-300 text-lg text-center mb-2">
                Welcome, {user?.email}
              </Text>
              <Text className="text-gray-400 text-center">
                Complete your subscription to unlock all features
              </Text>
            </View>

            {/* Subscription Benefits */}
            <View className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
              <Text className="text-white text-xl font-bold text-center mb-4">
                What You Get
              </Text>
              <View className="space-y-3">
                {features.slice(0, 4).map((feature, index) => (
                  <View key={index} className="flex-row items-center">
                    <Text className="text-green-400 text-lg mr-3">✓</Text>
                    <Text className="text-white text-base flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pricing Card */}
            <View className="bg-white p-6 rounded-lg mb-6">
              <Text className="text-black text-2xl font-bold text-center mb-2">
                €2.99/month
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Full access • Cancel anytime
              </Text>
              <Text className="text-gray-700 text-sm text-center">
                Start your transformation today
              </Text>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={subscriptionCreationLoading}
              className={`py-4 rounded-lg mb-4 ${
                subscriptionCreationLoading ? "bg-gray-700" : "bg-white"
              }`}
            >
              {subscriptionCreationLoading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="#000" />
                  <Text className="text-black text-lg font-bold ml-2">
                    Processing Payment...
                  </Text>
                </View>
              ) : (
                <Text className="text-black text-lg font-bold text-center">
                  Complete Subscription
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center">
              Secure payment • Cancel anytime • No hidden fees
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
