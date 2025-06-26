"use client";

import { createClient } from "@/integrations/supabase/client-ssr";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
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
  const supabase = createClient();

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
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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

    const interval = setInterval(validateSessionPeriodically, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [supabase.auth]);


  const signInWithMagicLink = async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };


  const signOut = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        clearAllAuthData();
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        if (
          error.message?.includes("session_not_found") ||
          error.code === "session_not_found"
        ) {
          clearAllAuthData();
          return;
        }
        throw error;
      }
    } catch (error: any) {
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
    setSession(null);
    setUser(null);

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
        signInWithMagicLink,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
