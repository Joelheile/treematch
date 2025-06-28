"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailStepProps {
  onCreateAccount: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function EmailStep({ onCreateAccount, isSubmitting }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    
    if (!email || !password) {
      return;
    }

    if (!email.endsWith("@stanford.edu")) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    await onCreateAccount(email, password);
  };

  const isValid = 
    email.trim() !== "" && 
    email.endsWith("@stanford.edu") &&
    password.trim() !== "" && 
    password.length >= 6 &&
    password === confirmPassword;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-gray-600">
          You're almost done! Create your account to save your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Stanford Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@stanford.edu"
            disabled={isSubmitting}
            className="w-full"
          />
          {email && !email.endsWith("@stanford.edu") && (
            <p className="text-sm text-red-500 mt-1">
              Please use a valid Stanford email address
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min 6 characters)"
            disabled={isSubmitting}
            className="w-full"
          />
          {password && password.length < 6 && (
            <p className="text-sm text-red-500 mt-1">
              Password must be at least 6 characters long
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={isSubmitting}
            className="w-full"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              Passwords do not match
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={!isValid || isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/auth/login" className="text-red-500 hover:text-red-600 font-medium">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}