import { AuthContext } from "@/hooks";
import { supabase } from "@/lib/supabase";
import { ApiClient, STORAGE_KEYS } from "@/services/api/config";
import { subscriptionApi } from "@/services/api/v1/subscription.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string;
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
  const [, setSubscriptionError] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session ? "exists" : "none");
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "",
          profileImageUrl:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            "",
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
          name: session.user.user_metadata?.name || "",
          profileImageUrl:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            "",
        });
        // Fetch subscription status for signed in user
        await fetchSubscriptionStatus();
      } else if (event === "SIGNED_OUT") {
        // Clear stored tokens
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_PROFILE,
        ]);
        setUser(null);
        setSubscription(null);
        setSession(null);
        setProfile(null);
        setSubscriptionError(false);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Update stored tokens when refreshed
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
        console.log("Tokens updated after refresh");
      }
    });

    // Listen for auth failure events from API client
    const handleAuthFailure = () => {
      console.log("Auth failure event received, signing out");
      signOut();
    };

    // Add event listener for auth failure (web-like approach)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("auth:failure", handleAuthFailure);
    }

    return () => {
      authSubscription.unsubscribe();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("auth:failure", handleAuthFailure);
      }
    };
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

        // Use the API client's refresh mechanism
        try {
          // Create a new instance to access the refreshTokens method
          const apiClientInstance = new ApiClient();
          const newToken = await apiClientInstance.refreshTokens();
          console.log("Session refreshed successfully via API client");
          return newToken;
        } catch (refreshError) {
          console.error(
            "Failed to refresh session via API client:",
            refreshError
          );

          // Fallback to direct Supabase refresh
          const {
            data: { session: newSession },
            error: fallbackError,
          } = await supabase.auth.refreshSession();

          if (fallbackError || !newSession) {
            console.error(
              "Failed to refresh session with fallback:",
              fallbackError
            );
            return null;
          }

          // Update stored tokens
          await AsyncStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            newSession.access_token
          );
          if (newSession.refresh_token) {
            await AsyncStorage.setItem(
              STORAGE_KEYS.REFRESH_TOKEN,
              newSession.refresh_token
            );
          }

          console.log("Session refreshed successfully via fallback");
          return newSession.access_token;
        }
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
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });

      console.log("Magic link response:", { data, error });

      if (error) throw error;

      console.log("Magic link sent successfully, showing toast");
      Toast.show({
        type: "success",
        text1: "Revisa tu correo electrónico",
        text2:
          "Te enviamos un enlace mágico. Por favor revisa tu correo y haz clic en el enlace para iniciar sesión.",
        position: "top",
        visibilityTime: 4000,
      });
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

      if (error) {
        console.log(error);
        throw error;
      }

      Toast.show({
        type: "success",
        text1: "Revisa tu correo electrónico",
        text2:
          "Te enviamos un enlace mágico. Por favor revisa tu correo y haz clic en el enlace para verificar tu cuenta.",
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error: any) {
      console.error("Error registering:", error);
      throw new Error(error.message || "Failed to register");
    }
  };

  const fetchSubscriptionStatus = useCallback(async () => {
    // Prevent multiple simultaneous subscription status fetches
    if (subscriptionLoading) {
      console.log("Subscription status already loading, skipping...");
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
  }, [subscriptionLoading]);

  const signOut = async () => {
    try {
      console.log("Signing out...");
      // Clear tokens first to prevent any further API calls
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);

      // Then sign out from Supabase
      await supabase.auth.signOut();

      // Update state
      setUser(null);
      setSubscription(null);
      setSession(null);
      setProfile(null);
      setSubscriptionError(false);
      setLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      // Ensure state is updated even if sign out fails
      setUser(null);
      setSubscription(null);
      setSession(null);
      setProfile(null);
      setSubscriptionError(false);
      setLoading(false);
    }
  };

  const refreshSubscription = useCallback(async () => {
    // Reset subscription error to allow fetching
    setSubscriptionError(false);
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const updateProfileImage = useCallback(
    async (imageUrl: string) => {
      if (!user) return;

      try {
        // Update local state
        setUser(prev => (prev ? { ...prev, profileImageUrl: imageUrl } : null));

        // Store in AsyncStorage for persistence
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE_IMAGE, imageUrl);

        // Update profile in database if needed
        if (session) {
          await supabase
            .from("profiles")
            .update({ profile_image_url: imageUrl })
            .eq("id", session.user.id);
        }
      } catch (error) {
        console.error("Failed to update profile image:", error);
      }
    },
    [user, session]
  );

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
        signOut,
        refreshSubscription,
        getCurrentToken,
        updateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
