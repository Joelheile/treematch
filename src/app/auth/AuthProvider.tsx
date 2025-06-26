"use client";

import { createClient } from "@/integrations/supabase/client-ssr";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const supabase = createClient();

  const checkIfNewUser = useCallback(
    async (userId: string) => {
      try {
        const { data: student } = await supabase
          .from("students")
          .select("id, name")
          .eq("id", userId)
          .single();

        // User is new if they don't have a student profile or no name
        setIsNewUser(!student || !student.name);
      } catch (error) {
        console.error("Error checking if new user:", error);
        setIsNewUser(true); // Assume new user on error
      }
    },
    [supabase]
  );

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (
            error.message?.includes("session_not_found") ||
            error.code === "session_not_found"
          ) {
            clearAllAuthData();
            return;
          }
          throw error;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Set loading to false immediately if we have a valid session
        if (session?.user) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        clearAllAuthData();
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'no user');
      
      setSession(session);
      setUser(session?.user ?? null);

      // Set loading to false immediately for user state changes
      setLoading(false);

      // Check if this is a new user after successful sign in (async operation)
      if (event === "SIGNED_IN" && session?.user) {
        checkIfNewUser(session.user.id); // Don't await this to avoid blocking
      }

      // Clear user state on sign out
      if (event === "SIGNED_OUT") {
        console.log('User signed out, clearing state');
        setSession(null);
        setUser(null);
        setIsNewUser(false);
      }
    });

    const validateSessionPeriodically = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error || !session) {
          clearAllAuthData();
        }
      } catch (error) {
        clearAllAuthData();
      }
    };

    const interval = setInterval(validateSessionPeriodically, 2 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [supabase.auth, checkIfNewUser]);

  const signUp = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!email.endsWith("@stanford.edu")) {
      throw new Error("Please use your Stanford email address (@stanford.edu)");
    }

    console.log("Signing up user:", email);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      console.error("Sign up error:", error);
      throw error;
    }

    console.log("Sign up successful:", data);

    // If email confirmation is disabled or user is auto-confirmed, they'll be signed in automatically
    // If not, we'll need to handle this based on the Supabase configuration
    if (data.user && !data.user.email_confirmed_at) {
      console.log("User needs email confirmation");
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    console.log("Signing in user:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }

    console.log("Sign in successful:", data);
  };

  const signOut = async () => {
    console.log('Starting signOut process...');
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log('No session found, clearing auth data');
        clearAllAuthData();
        return;
      }

      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SignOut error:', error);
        if (
          error.message?.includes("session_not_found") ||
          error.code === "session_not_found"
        ) {
          clearAllAuthData();
          return;
        }
        throw error;
      }
      
      console.log('SignOut successful, clearing auth data');
      clearAllAuthData();
    } catch (error: any) {
      console.error('Exception during signOut:', error);
      if (
        error.message?.includes("session_not_found") ||
        error.code === "session_not_found"
      ) {
        clearAllAuthData();
        return;
      }
      throw error;
    }
  };

  const clearAllAuthData = () => {
    console.log('Clearing all auth data...');
    setSession(null);
    setUser(null);
    setIsNewUser(false);

    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();

        const cookies = document.cookie.split(";");
        cookies.forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        console.log('Auth data cleared successfully');
      } catch (error) {
        console.error("Error clearing auth data:", error);
      }
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isNewUser,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
