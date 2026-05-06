import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "EventHub Pro — World-Class Event Ticketing",
    template: "%s | EventHub Pro",
  },
  description:
    "Discover, buy, and sell event tickets on EventHub Pro — concerts, sports, theatre, festivals and more. Secure digital tickets with QR codes.",
  keywords: ["event tickets", "concerts", "sports tickets", "festivals", "live events"],
  authors: [{ name: "EventHub Pro" }],
  creator: "EventHub Pro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "EventHub Pro",
    title: "EventHub Pro — World-Class Event Ticketing",
    description: "Discover, buy, and sell event tickets for any event worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventHub Pro",
    description: "World-class event ticketing marketplace",
    creator: "@eventhubpro",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
