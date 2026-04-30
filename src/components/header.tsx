import { Suspense } from "react";
import Link from "next/link";

import { isSubscribed } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscribeButton } from "@/components/subscribe-button";
import { Logo } from "@/components/logo";
import { HeaderNav } from "@/components/header-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 text-foreground shadow-[0_1px_0_oklch(1_0_0/0.5)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/82">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Logo />
          <Suspense fallback={<HeaderNavFallback />}>
            <HeaderNav />
          </Suspense>
        </div>

        {/* SubscriptionStatus reads a cookie (dynamic), so it can't be part of the static shell.
            Suspense streams it in after the initial HTML without blocking the rest of the header. */}
        <Suspense fallback={<SubscriptionStatusFallback />}>
          <SubscriptionStatus />
        </Suspense>
      </div>
    </header>
  );
}

function HeaderNavFallback() {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 md:flex"
    >
      <Link
        href="/"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        Home
      </Link>
      <Link
        href="/search"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        Search
      </Link>
    </nav>
  );
}

async function SubscriptionStatus() {
  const subscribed = await isSubscribed();

  if (subscribed) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant="secondary"
          className="hidden gap-1 rounded-full sm:inline-flex"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Subscribed
        </Badge>
        <SubscribeButton mode="unsubscribe" variant="secondary" size="sm">
          Leave
        </SubscribeButton>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <SubscribeButton mode="subscribe" variant="secondary" size="sm">
        Join
      </SubscribeButton>
    </div>
  );
}

function SubscriptionStatusFallback() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Skeleton className="h-7 w-16 rounded-full bg-muted" />
    </div>
  );
}
