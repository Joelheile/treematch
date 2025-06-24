"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const handleLogoutClick = () => {
    router.push("/logout");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleLogoutClick}
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        title="Sign out"
      >
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
};
