"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingStorage } from "@/lib/onboarding-storage";
import { CheckCircle, Mail, TreePine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const router = useRouter();
  const { signInWithMagicLink, signInWithGoogle } = useAuth();

  useEffect(() => {
    setHasOnboardingData(
      OnboardingStorage.exists() && !OnboardingStorage.isExpired()
    );
  }, []);

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!email.endsWith("@stanford.edu")) {
      toast.error("Please use your Stanford email address (@stanford.edu)");
      setLoading(false);
      return;
    }

    try {
      await signInWithMagicLink(email);
      setSuccess(true);
      toast.success("Check your email for a magic link to sign up!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent you a magic link at <strong>{email}</strong>. Click the link to complete your signup.
            </p>
            {hasOnboardingData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-medium">
                  Great! Your profile information is saved.
                </p>
                <p>
                  Once you verify your email and sign in, your profile will be
                  automatically created.
                </p>
              </div>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <TreePine className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Join TreeMatch</h1>
          <p className="text-muted-foreground">
            {hasOnboardingData
              ? "Almost done! Create your account to complete your profile."
              : "Start connecting with Stanford students today"}
          </p>
        </div>

        {hasOnboardingData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium">✨ Your profile information is saved!</p>
            <p>
              Create your account below and we'll set everything up for you.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleMagicLinkSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Sending magic link..." : "Send magic link"}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>

            {!hasOnboardingData && (
              <p className="text-xs text-muted-foreground">
                New here?{" "}
                <Link
                  href="/edit"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Start with our quick setup
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
