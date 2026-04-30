import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";

import { getArticleSlugById, getBreaking } from "@/lib/data/articles";
import {
  categoryBadgeClass,
  categoryDotClass,
  formatCategory,
} from "@/lib/category-style";

// Async Server Component — fetches breaking news with a two-minute cache so the banner
// stays stable across quick navigations without a live API call on every page view.
export async function BreakingBanner() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 });
  cacheTag("breaking");

  const item = await getBreaking();
  if (!item) return null;

  const articleSlug = await getArticleSlugById(item.articleId);
  if (!articleSlug) return null;

  const category = formatCategory(item.category);
  const date = new Date(item.publishedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <section
      aria-label="Breaking news"
      className="border-b border-border/60 bg-background"
    >
      <Link
        href={`/articles/${articleSlug}`}
        className="group block transition-colors hover:bg-foreground/2.5"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Accent bar + badge */}
          <div className="shrink-0">
            <div
              className={
                item.urgent
                  ? "h-8 w-0.5 rounded-full bg-destructive"
                  : "h-8 w-0.5 rounded-full bg-accent-brand"
              }
              aria-hidden
            />
          </div>

          {/* Meta + headline */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <span
                className={categoryBadgeClass(
                  item.category,
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[0.58rem]",
                )}
              >
                <span className={categoryDotClass(item.category, "size-1 rounded-full")} />
                {category}
              </span>
              <span aria-hidden>·</span>
              <time dateTime={item.publishedAt} className="font-mono tabular-nums">
                {date}
              </time>
            </div>
            <p className="mt-0.5 line-clamp-1 max-w-[calc(100vw-14rem)] wrap-break-word font-heading text-base font-semibold leading-snug text-foreground sm:max-w-none sm:text-lg">
              {item.headline}
            </p>
          </div>

          {/* Read CTA (sm+) */}
          <div className="hidden shrink-0 items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground sm:flex">
            Read
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>
        </div>
      </Link>
    </section>
  );
}

export function BreakingBannerSkeleton() {
  return (
    <div
      aria-label="Loading breaking news"
      className="border-b border-border/60 bg-background"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="shrink-0">
          <div className="h-8 w-0.5 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="hidden h-3 w-12 animate-pulse rounded bg-muted sm:block" />
      </div>
    </div>
  );
}
