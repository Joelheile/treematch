"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, UserX, ShieldX, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = () => {
    switch (error) {
      case "invalid_credentials":
        return {
          icon: Lock,
          title: "Invalid Credentials",
          message: "The email or password you entered is incorrect.",
          suggestion: "Please check your credentials and try again.",
          actionText: "Try Again",
          actionLink: "/auth/login",
        };
      case "account_not_found":
        return {
          icon: UserX,
          title: "Account Not Found",
          message: "No account exists with this email address.",
          suggestion: "Create an account to get started.",
          actionText: "Create Account",
          actionLink: "/edit",
        };
      case "too_many_attempts":
        return {
          icon: ShieldX,
          title: "Too Many Attempts",
          message: "Your account has been temporarily locked due to too many failed login attempts.",
          suggestion: "Please wait a few minutes before trying again.",
          actionText: "Try Again Later",
          actionLink: "/auth/login",
        };
      case "email_not_confirmed":
        return {
          icon: Mail,
          title: "Email Not Verified",
          message: "Please verify your email address before signing in.",
          suggestion: "Check your email for a verification link.",
          actionText: "Resend Email",
          actionLink: "/edit",
        };
      case "signup_disabled":
        return {
          icon: AlertCircle,
          title: "Signup Temporarily Disabled",
          message: "New account creation is temporarily disabled.",
          suggestion: "Please try again later or contact support.",
          actionText: "Try Again",
          actionLink: "/edit",
        };
      default:
        return {
          icon: AlertCircle,
          title: "Authentication Error",
          message: "There was a problem with your authentication request.",
          suggestion: "Please try again or contact support if the problem persists.",
          actionText: "Try Again",
          actionLink: "/auth/login",
        };
    }
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="TreeMatch" width={64} height={64} />
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {errorDetails.title}
          </h1>
          <p className="text-gray-600">{errorDetails.message}</p>
          <p className="text-sm text-gray-500">{errorDetails.suggestion}</p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={errorDetails.actionLink}>
              {errorDetails.actionText}
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="text-xs text-gray-400 space-y-2">
          <p>Need help? Contact support at support@treematch.com</p>
          {error === "too_many_attempts" && (
            <p className="text-blue-600">
              💡 Tip: Wait 15 minutes before attempting to sign in again
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="TreeMatch" width={64} height={64} className="mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}