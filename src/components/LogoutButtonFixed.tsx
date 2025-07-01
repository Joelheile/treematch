"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButtonFixed() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      window.location.href = "/auth/login";
    } catch (error: any) {
      console.error("Error signing out:", error);
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={handleSignOut}
        disabled={loading}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm text-gray-700 border-gray-300 hover:bg-gray-50 shadow-lg transition-all duration-200 w-10 h-10 p-0"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}