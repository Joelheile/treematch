"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to TreeMatch!
          </h1>
          <p className="text-gray-600">
            Your account has been successfully created{email && ` for ${email}`}. You can now start connecting with other Stanford students.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Image src="/logo.png" alt="TreeMatch Logo" width={16} height={16} />
            <span>Your profile is ready to go</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            Start Matching
          </Button>
          
          <Button
            onClick={() => router.push("/auth/login")}
            variant="outline"
            className="w-full"
          >
            Sign In Later
          </Button>
        </div>
      </div>
    </div>
  );
} 