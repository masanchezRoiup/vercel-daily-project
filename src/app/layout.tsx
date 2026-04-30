import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";

import "./globals.css";
import { Header } from "@/components/header";
import { FooterYear } from "@/components/footer-year";
import { Logo } from "@/components/logo";
import { SubscriptionActionProvider } from "@/components/subscription-action-provider";
import { TopAccent } from "@/components/top-accent";
import { Toaster } from "@/components/ui/sonner";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vercel Daily",
    template: "%s · Vercel Daily",
  },
  description:
    "A fictional news publication showcasing Next.js 16 patterns — use cache, Server Actions, proxy, and streaming.",
  applicationName: "Vercel Daily",
  openGraph: {
    title: "Vercel Daily",
    description:
      "A fictional news publication showcasing Next.js 16 patterns.",
    type: "website",
    siteName: "Vercel Daily",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vercel Daily",
    description:
      "A fictional news publication showcasing Next.js 16 patterns.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TopAccent />
        <SubscriptionActionProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </SubscriptionActionProvider>
        <footer className="border-t border-border/70 bg-foreground text-background">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0 space-y-3">
              <Logo />
              <p className="max-w-xl text-sm leading-relaxed text-background/65">
                ©{" "}
                {/* FooterYear is a cached async Server Component; Suspense is required by Cache Components
                    when a cached component is nested inside a dynamic render boundary. */}
                <Suspense fallback={<span className="tabular-nums">—</span>}>
                  <FooterYear />
                </Suspense>{" "}
                Vercel Daily. Developed by Miguel A. Sanchez Castel.
              </p>
            </div>
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <Link
                href="/"
                className="rounded-full border border-background/10 px-3 py-1.5 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                Home
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-background/10 px-3 py-1.5 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                Search
              </Link>
            </nav>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
