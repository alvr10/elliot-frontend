import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

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

export type AuthData = {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  subscriptionLoading: boolean;
  session?: Session | null;
  profile?: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  getCurrentToken: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthData>({
  user: null,
  subscription: null,
  loading: true,
  subscriptionLoading: false,
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshSubscription: async () => {},
  getCurrentToken: async () => null,
});

export const useAuthContext = () => useContext(AuthContext);

// Export useAuth as an alias for useAuthContext to maintain compatibility
export const useAuth = useAuthContext;
