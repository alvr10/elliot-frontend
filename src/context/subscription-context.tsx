import { useAuth } from "@/hooks";
import { subscriptionApi } from "@/services/api";
import React, { createContext, useContext } from "react";
import { Alert } from "react-native";

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
  const { refreshSubscription, user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const createSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true);

      // Check if user is signed in
      if (!user) {
        Alert.alert("Error", "Please sign in first");
        return false;
      }

      console.log("Creating beta subscription for user:", user.email);

      // For beta, just create subscription without payment
      await subscriptionApi.createSubscription({ planId: "beta" });
      await refreshSubscription();

      Alert.alert("Success!", "Beta access granted. Welcome to CaffTracker!", [
        {
          text: "Continue",
          onPress: () => {
            // Force a refresh of app state
          },
        },
      ]);

      return true;
    } catch (error: any) {
      console.error("Beta subscription creation failed:", error);

      let errorMessage = "Please try again.";

      // Handle specific error cases
      if (error?.response?.status === 401) {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Service unavailable. Please try again later.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Beta Access Failed", errorMessage);
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
