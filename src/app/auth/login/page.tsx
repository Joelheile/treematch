"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail, TreePine } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.endsWith("@stanford.edu");
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "").substring(0, 255);
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithMagicLink, signInWithGoogle } = useAuth();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      toast.error("Please use a valid Stanford email address (@stanford.edu)");
      setLoading(false);
      return;
    }

    try {
      await signInWithMagicLink(sanitizedEmail);
      setEmailSent(true);
      toast.success("Check your email for a magic link to sign in!");
    } catch (err: any) {
      setError(err.message || "An error occurred while sending the magic link");
      toast.error(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const errorFromUrl = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <TreePine className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to TreeMatch
          </h1>
          <p className="text-muted-foreground">
            Connect with Stanford students and build together
          </p>
        </div>

        <div className="space-y-6">
          {(error || errorFromUrl) && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error || errorFromUrl}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a magic link to <strong>{email}</strong>. Click
                    the link in your email to sign in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Use a different email
                </Button>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
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
                    maxLength={255}
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
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New to TreeMatch?{" "}
              <Link
                href="/edit"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Create your profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
