"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = () => {
    switch (error) {
      case "expired":
        return {
          icon: Clock,
          title: "Magic Link Expired",
          message: "Your magic link has expired. Magic links are only valid for 1 hour for security reasons.",
          suggestion: "Please request a new magic link to continue.",
          actionText: "Get New Magic Link",
          actionLink: "/auth/signup",
        };
      case "invalid":
        return {
          icon: AlertCircle,
          title: "Invalid Link",
          message: "This magic link is invalid or has already been used.",
          suggestion: "Please request a new magic link to continue.",
          actionText: "Get New Magic Link",
          actionLink: "/auth/signup",
        };
      case "rate_limited":
        return {
          icon: AlertCircle,
          title: "Too Many Attempts",
          message: "This magic link has been tried too many times and is now blocked for security.",
          suggestion: "Please wait a few minutes and request a new magic link.",
          actionText: "Get New Magic Link",
          actionLink: "/auth/signup",
        };
      case "unknown":
        return {
          icon: AlertCircle,
          title: "Verification Failed",
          message: "We couldn't verify your magic link due to an unexpected error.",
          suggestion: "Please try requesting a new magic link.",
          actionText: "Get New Magic Link",
          actionLink: "/auth/signup",
        };
      case "exception":
        return {
          icon: AlertCircle,
          title: "System Error",
          message: "A technical error occurred while processing your request.",
          suggestion: "Please try again in a few moments or contact support.",
          actionText: "Try Again",
          actionLink: "/auth/signup",
        };
      default:
        return {
          icon: AlertCircle,
          title: "Authentication Error",
          message: "There was a problem verifying your email address.",
          suggestion: "Please try again or contact support if the problem persists.",
          actionText: "Try Again",
          actionLink: "/auth/signup",
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
          <Image src="/icon.png" alt="TreeMatch" width={64} height={64} />
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
              <Mail className="w-4 h-4 mr-2" />
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
          {error === "expired" && (
            <p className="text-blue-600">
              💡 Tip: Check your email immediately after requesting a magic link
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/icon.png" alt="TreeMatch" width={64} height={64} className="mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}