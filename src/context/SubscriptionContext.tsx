import { useStripe } from "@stripe/stripe-react-native";
import React, { createContext, useContext } from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  createSubscription: () => Promise<boolean>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();
  const { refreshSubscription, user, getCurrentToken } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const createSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true);

      // Check if user is signed in
      if (!user) {
        Alert.alert("Error", "Please sign in first");
        return false;
      }

      console.log("Creating subscription for user:", user.email);

      // Get current valid token (with refresh if needed)
      const token = await getCurrentToken();

      if (!token) {
        Alert.alert("Error", "Authentication failed. Please sign in again.");
        return false;
      }

      console.log("Got valid token, creating setup intent...");

      // Step 1: Create setup intent on backend
      const setupResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/setup-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Setup response status:", setupResponse.status);

      if (!setupResponse.ok) {
        const errorText = await setupResponse.text();
        console.error("Setup intent error:", errorText);

        if (setupResponse.status === 401) {
          Alert.alert("Error", "Session expired. Please sign in again.");
          return false;
        }

        throw new Error(`Setup intent failed: ${errorText}`);
      }

      const { client_secret, customer_id, setup_intent_id } =
        await setupResponse.json();
      console.log("Got setup intent:", {
        client_secret: client_secret ? "exists" : "missing",
        customer_id,
        setup_intent_id: setup_intent_id || "missing",
      });

      if (!client_secret) {
        throw new Error("No client secret received from server");
      }

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: client_secret,
        merchantDisplayName: "CaffTracker",
        returnURL: "cafftracker://payment-return",
        allowsDelayedPaymentMethods: true,
        appearance: {
          colors: {
            primary: "#000000",
          },
        },
      });

      if (initError) {
        console.error("Init payment sheet error:", initError);
        throw new Error(`Payment sheet init failed: ${initError.message}`);
      }

      console.log("Payment sheet initialized, presenting...");

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
          console.log("User cancelled payment");
          return false;
        }
        console.error("Present payment sheet error:", presentError);
        throw new Error(`Payment failed: ${presentError.message}`);
      }

      console.log("Payment completed, creating subscription...");

      // Step 4: Get fresh token for subscription creation
      const freshToken = await getCurrentToken();
      if (!freshToken) {
        throw new Error("Failed to get fresh authentication token");
      }

      // Create subscription
      const subscriptionResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            customer_id,
            setup_intent_id,
          }),
        }
      );

      console.log("Subscription response status:", subscriptionResponse.status);

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        console.error("Subscription creation error:", errorData);

        // Handle specific error types
        if (
          errorData.error?.includes("declined") ||
          errorData.error?.includes("card")
        ) {
          throw new Error(
            "Payment was declined. Please try a different payment method."
          );
        }

        if (errorData.error?.includes("payment method")) {
          throw new Error("Payment method setup failed. Please try again.");
        }

        throw new Error(errorData.error || "Subscription failed");
      }

      const subscriptionData = await subscriptionResponse.json();
      console.log("Subscription response:", subscriptionData);

      // Handle different response scenarios
      if (
        subscriptionData.status === "requires_action" &&
        subscriptionData.client_secret
      ) {
        console.log("Subscription requires additional verification");

        // Handle 3D Secure authentication
        const { error: confirmError } = await confirmPayment(
          subscriptionData.client_secret
        );

        if (confirmError) {
          console.error("Payment confirmation failed:", confirmError);
          throw new Error("Payment verification failed. Please try again.");
        }

        console.log("Payment confirmed, checking final status...");

        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if subscription is actually active
      if (
        subscriptionData.status === "active" ||
        subscriptionData.status === "trialing"
      ) {
        console.log("Subscription is active");
      } else if (subscriptionData.status === "incomplete") {
        throw new Error(
          "Payment could not be processed. Please try again with a different payment method."
        );
      } else {
        console.log("Subscription status:", subscriptionData.status);
      }

      // Step 5: Refresh subscription status
      console.log("Refreshing subscription status...");
      await refreshSubscription();

      // Double-check the subscription status after refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        "Success!",
        "Your subscription has been activated. Welcome to CaffTracker Pro!",
        [
          {
            text: "Continue",
            onPress: () => {
              // Force a refresh of the app state
            },
          },
        ]
      );

      return true;
    } catch (error) {
      console.error("Subscription creation failed:", error);

      let errorMessage = "Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Subscription Failed", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ createSubscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
