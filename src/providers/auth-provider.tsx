import { AuthContext } from "@/hooks";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/services/api/config";
import { subscriptionApi } from "@/services/api/v1/subscription.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { Alert } from "react-native";

interface User {
  id: string;
  email: string;
}

interface Subscription {
  status:
    | "active"
    | "inactive"
    | "cancelled"
    | "past_due"
    | "trialing"
    | "active_until_period_end";
  expires_at?: string;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [session, setSession] = useState<Session | undefined | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscriptionError, setSubscriptionError] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session ? "exists" : "none");
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
        });
        fetchSubscriptionStatus();
      } else {
        setLoading(false); // No user, done loading
      }
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth event:",
        event,
        "Session:",
        session ? "exists" : "none"
      );
      setSession(session);

      if (event === "SIGNED_IN" && session?.user) {
        // Store the access token for API requests
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          session.access_token
        );
        if (session.refresh_token) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            session.refresh_token
          );
        }

        setUser({
          id: session.user.id,
          email: session.user.email!,
        });
        // Fetch subscription status for signed in user
        await fetchSubscriptionStatus();
      } else if (event === "SIGNED_OUT") {
        // Clear stored tokens
        await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        setUser(null);
        setSubscription(null);
        setSession(null);
        setProfile(null);
        setSubscriptionError(false);
        setLoading(false);
      }
    });

    return () => authSubscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [session]);

  const getCurrentToken = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return null;
      }

      if (!session) {
        console.log("No session found");
        return null;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

      console.log("Token expires in:", timeUntilExpiry, "seconds");

      if (timeUntilExpiry < 300) {
        console.log("Token expiring soon, refreshing...");

        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession) {
          console.error("Failed to refresh session:", refreshError);
          return null;
        }

        console.log("Session refreshed successfully");
        return newSession.access_token;
      }

      return session.access_token;
    } catch (error) {
      console.error("Error getting current token:", error);
      return null;
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      console.log("Requesting magic link for:", email);
      // Use Supabase directly for magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;

      Alert.alert(
        "Check your email",
        "We sent you a magic link. Please check your email and click the link to sign in."
      );
    } catch (error: any) {
      console.error("Error requesting magic link:", error);
      throw new Error(error.message || "Failed to send magic link");
    }
  };

  const signUpWithEmail = async (email: string, name: string) => {
    try {
      console.log("Registering with email:", email);
      // Use Supabase directly for magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      Alert.alert(
        "Check your email",
        "We sent you a magic link. Please check your email and click the link to verify your account."
      );
    } catch (error: any) {
      console.error("Error registering:", error);
      throw new Error(error.message || "Failed to register");
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Signing in with Google...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URI,
        },
      });

      if (error) throw error;

      console.log("Google sign in initiated:", data);
      // Note: For mobile apps, this will open the browser/OAuth flow
      // The result will be handled by the auth state change listener
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw new Error(error.message || "Failed to sign in with Google");
    }
  };

  const fetchSubscriptionStatus = async () => {
    // Don't fetch if we already had an error
    if (subscriptionError) {
      console.log("Skipping subscription fetch due to previous error");
      setSubscriptionLoading(false);
      setLoading(false);
      return;
    }

    setSubscriptionLoading(true);
    try {
      console.log("Fetching subscription status...");
      const response = await subscriptionApi.getSubscriptionStatus();

      console.log("Subscription status response:", response);

      // Set subscription data regardless of status - convert status to match interface
      setSubscription({
        status: response.status as any,
        expires_at: response.endDate,
      });
      setSubscriptionError(false);
    } catch (error: any) {
      console.error("Failed to fetch subscription status:", error);
      setSubscriptionError(true); // Set error flag to prevent retries

      // Stop retrying on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        console.log("Stopping subscription status fetch due to auth/error");
        setSubscription({ status: "inactive", expires_at: undefined });
        // Clear tokens on auth error
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
      } else {
        setSubscription({ status: "inactive", expires_at: undefined });
      }
    } finally {
      setSubscriptionLoading(false);
      setLoading(false); // Clear main loading after subscription check
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        subscriptionLoading,
        session,
        profile,
        isLoading: loading,
        isLoggedIn: session !== undefined,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshSubscription,
        getCurrentToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
