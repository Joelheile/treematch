"use client";

import { supabase } from "@/integrations/supabase/client-ssr";
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
  // Using singleton supabase client
  const initializedRef = useRef(false);

  const checkIfNewUser = useCallback(
    async (userId: string) => {
      try {
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
    [supabase]
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
        console.log('AuthProvider: Starting initial auth...');
        
        // Remove timeout - just get session directly
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider: Session error:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Got session:', !!session, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: Checking if new user...');
          await checkIfNewUser(session.user.id);
        }
        
        console.log('AuthProvider: Setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error("Error during initial auth:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        setLoading(false);
      }
    };

    // Safeguard: Force loading to false after 10 seconds
    const loadingTimeout = setTimeout(() => {
      console.warn('AuthProvider: Force setting loading to false after timeout');
      setLoading(false);
    }, 10000);

    initAuth().finally(() => {
      clearTimeout(loadingTimeout);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
  }, [supabase.auth, checkIfNewUser, clearAllAuthData]);

  const signInWithMagicLink = async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }

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
