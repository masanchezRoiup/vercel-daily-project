import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[inset_0_1px_0_oklch(1_0_0/0.18)]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M12 3 L22 20 L2 20 Z" />
        </svg>
      </span>
      <span className="truncate">Vercel Daily</span>
    </Link>
  );
}
