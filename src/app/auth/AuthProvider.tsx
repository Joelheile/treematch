"use client";

import { createClient } from "@/integrations/supabase/client-ssr";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithMagicLink: (
    email: string,
    shouldCreateUser?: boolean
  ) => Promise<void>;
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
  const initializedRef = useRef(false);

  console.log('[AuthProvider] render', { user, session, loading, isNewUser });

  const checkIfNewUser = useCallback(
    async (userId: string) => {
      try {
        const { data: student } = await supabase
          .from("students")
          .select("id, name")
          .eq("id", userId)
          .single();
        setIsNewUser(!student || !student.name);
        console.log('[AuthProvider] setIsNewUser', !student || !student.name, { student });
      } catch (error) {
        console.error("Error checking if new user:", error);
        setIsNewUser(true);
        console.log('[AuthProvider] setIsNewUser (error)', true);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log('[AuthProvider] useEffect start - initializing auth');

    const initAuth = async () => {
      try {
        console.log('[AuthProvider] Calling supabase.auth.getSession()');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthProvider] getSession result:', session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkIfNewUser(session.user.id);
        }
        
        setLoading(false);
        console.log('[AuthProvider] Initial auth complete', { user: session?.user ?? null, session });
      } catch (error) {
        console.error('[AuthProvider] Error during initial auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] onAuthStateChange event:', event, 'session:', session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === "SIGNED_IN" && session?.user) {
        await checkIfNewUser(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setIsNewUser(false);
      }
    });

    const validateSessionPeriodically = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.log('[AuthProvider] validateSessionPeriodically: clearing auth data due to error or no session', error, session);
          clearAllAuthData();
        }
      } catch (error) {
        console.log('[AuthProvider] validateSessionPeriodically: exception, clearing auth data', error);
        clearAllAuthData();
      }
    };

    const interval = setInterval(validateSessionPeriodically, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
      console.log('[AuthProvider] useEffect cleanup');
    };
  }, [supabase.auth, checkIfNewUser]);

  console.log('[AuthProvider] returning context', { user, session, loading, isNewUser });

  const signInWithMagicLink = async (
    email: string,
    shouldCreateUser: boolean = true
  ) => {
    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Sending magic link to:", email);
    console.log("Redirect URL:", `${window.location.origin}/auth/confirm`);
    console.log("Should create user:", shouldCreateUser);

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      console.error("Magic link error details:", error);
      throw error;
    }

    console.log("Magic link sent successfully:", data);
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
        signInWithMagicLink,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
