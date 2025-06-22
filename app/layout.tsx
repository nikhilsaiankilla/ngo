import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner"
import { Providers } from "./(root)/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hussaini Welfare Association",
    template: "%s | Hussaini Welfare Association",
  },
  description: "Empowering the underprivileged through transparent donations, organized events, and community-driven support — all powered by the Hussaini Welfare Association platform.",
  keywords: ["donation", "charity", "Hussaini", "welfare", "NGO", "community support", "events"],
  metadataBase: new URL("https://yourdomain.com"), // Replace with your domain
  alternates: {
    canonical: "https://yourdomain.com",
  },
  openGraph: {
    title: "Hussaini Welfare Association",
    description: "Empowering the underprivileged through transparent donations, organized events, and community-driven support.",
    url: "https://yourdomain.com",
    siteName: "Hussaini Welfare Association",
    images: [
      {
        url: "/opengraph-image.png", // Relative to /public
        width: 1200,
        height: 630,
        alt: "Hussaini Welfare Association – Empowering the Underprivileged",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hussaini Welfare Association",
    description: "Empowering the underprivileged through transparent donations, organized events, and community-driven support.",
    images: ["/opengraph-image.png"],
    site: "@hussainiwelfare", // Optional: replace with your Twitter handle
    creator: "@hussainiwelfare", // Optional
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-light w-full`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
