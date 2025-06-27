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
  const [isNewUser, setIsNewUser] = useState(false);
  const initializedRef = useRef(false);

  const checkIfNewUser = useCallback(
    async (userId: string) => {
      try {
        const supabase = createClient()
        const { data: student } = await supabase
          .from("students")
          .select("id, name")
          .eq("id", userId)
          .single();
        setIsNewUser(!student || !student.name);
      } catch (error) {
        console.error("Error checking if new user:", error);
        setIsNewUser(true);
      }
    },
    []
  );

  const clearAllAuthData = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      try {
        const supabase = createClient()
        
        console.log('🔄 AuthProvider: Initializing auth...')
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ AuthProvider: Session error:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('✅ AuthProvider: Session retrieved:', !!session)
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthProvider: User found:', session.user.email)
          await checkIfNewUser(session.user.id);
        }
        
        setLoading(false);
        console.log('✅ AuthProvider: Initialization complete')
      } catch (error) {
        console.error("💥 AuthProvider: Error during init:", error);
        setLoading(false);
      }
    };

    // Reduced timeout to 5 seconds and better logging
    const loadingTimeout = setTimeout(() => {
      console.warn('⏰ AuthProvider: Force setting loading to false after 5s timeout');
      setLoading(false);
    }, 5000);

    initAuth().finally(() => {
      clearTimeout(loadingTimeout);
    });

    const supabaseForAuth = createClient()
    const { data: { subscription } } = supabaseForAuth.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthProvider: Auth state change:', event, !!session)
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === "SIGNED_IN" && session?.user) {
        console.log('✅ AuthProvider: User signed in:', session.user.email)
        await checkIfNewUser(session.user.id);
      } else if (event === "SIGNED_OUT") {
        console.log('👋 AuthProvider: User signed out')
        setIsNewUser(false);
      }
    });

    const validateSessionPeriodically = async () => {
      try {
        const supabaseForValidation = createClient()
        const { data: { session }, error } = await supabaseForValidation.auth.getSession();
        if (error || !session) {
          console.log('⚠️ AuthProvider: Session validation failed, clearing auth')
          clearAllAuthData();
        }
      } catch (error) {
        console.log('💥 AuthProvider: Session validation error, clearing auth')
        clearAllAuthData();
      }
    };

    const interval = setInterval(validateSessionPeriodically, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkIfNewUser, clearAllAuthData]);

  const signInWithMagicLink = async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient()
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

  const signInWithGoogle = async () => {
    const supabase = createClient()
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
