import { LogoutButton } from "@/components/LogoutButton";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import React from "react";
import { ClientToasters } from "./client-toasters";
import "./globals.css";
import { Providers } from "./providers";
import { PostAuthOnboardingProcessor } from "@/components/PostAuthOnboardingProcessor";

export const metadata: Metadata = {
  title: "TreeMatch",
  description: "Stanford Student Matching Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientToasters />
          <PostAuthOnboardingProcessor />
          {children}
          <LogoutButton />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
