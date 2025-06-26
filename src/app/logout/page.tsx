"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LogoutPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  console.log('[LogoutPage] Component render', { user: !!user, loading });

  useEffect(() => {
    console.log('[LogoutPage] Auth state changed', { user: !!user });
  }, [user]);

  const handleLogout = async () => {
    console.log('[LogoutPage] Starting logout process');
    setLoading(true);
    try {
      await signOut();
      console.log('[LogoutPage] SignOut completed, redirecting...');
      // Use window.location.href for a full page redirect to ensure clean logout
      window.location.href = "/auth/login";
    } catch (error: any) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('[LogoutPage] Cancel clicked, going back');
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 relative">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign Out</h1>
          <p className="text-gray-600">
            Are you sure you want to sign out of TreeMatch?
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 h-auto text-lg"
            size="lg"
          >
            {loading ? "Signing out..." : "Yes, Sign Out"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full font-semibold px-8 py-4 h-auto text-lg"
            size="lg"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        © summer builders
      </div>
    </div>
  );
}
