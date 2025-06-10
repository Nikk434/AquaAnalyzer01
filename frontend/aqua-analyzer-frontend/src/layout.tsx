// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AquaAnalyzer - Fish Detection & Monitoring System",
  description:
    "IoT-based ML project for fish detection, species identification, and aquatic environment monitoring",
  keywords:
    "fish detection, IoT, machine learning, aquaculture, monitoring system",
  authors: [{ name: "AquaAnalyzer Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">{children}</div>
        <div id="modal-root" />
      </body>
    </html>
  );
}

// src/app/page.tsx

// src/middleware.ts

// Get token from cookies or headers (in a real app, you'd check for JWT)
// For demo purposes
