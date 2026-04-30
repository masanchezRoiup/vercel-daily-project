import { cacheLife, cacheTag } from "next/cache";

import { getTrending } from "@/lib/data/articles";
import {
  ArticleMiniCard,
  ArticleMiniCardSkeleton,
} from "@/components/ui/article-mini-card";
import { Skeleton } from "@/components/ui/skeleton";

// Async Server Component streamed inside a Suspense boundary on the article page.
// Trending is fetched as one global cached list so it stays stable while moving
// between articles; the current article is filtered locally.
export async function TrendingSidebar({ exclude }: { exclude?: string[] } = {}) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 });
  cacheTag("trending");

  const excludedIds = new Set(exclude);
  const articles = (await getTrending())
    .filter((article) => !excludedIds.has(article.id))
    .slice(0, 4);

  return (
    <aside
      aria-label="Trending articles"
      className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-[0_18px_50px_oklch(0.18_0.008_260/0.05)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/70 pb-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trending
        </h2>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
          5 min cache
        </span>
      </div>
      <ol className="space-y-4">
        {articles.map((article, idx) => (
          <li key={article.id}>
            <ArticleMiniCard article={article} index={idx} />
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function TrendingSidebarSkeleton() {
  return (
    <aside className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-[0_18px_50px_oklch(0.18_0.008_260/0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/70 pb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <ul className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <ArticleMiniCardSkeleton />
          </li>
        ))}
      </ul>
    </aside>
  );
}
