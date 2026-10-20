import type { Metadata, Viewport } from "next";
import React from "react";
import { ClientToasters } from "./client-toasters";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TreeMatch",
  description: "Stanford Student Matching Platform",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
