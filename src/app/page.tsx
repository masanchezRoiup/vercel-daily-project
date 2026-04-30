import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

import { getFeaturedArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/article-card";
import {
  BreakingBanner,
  BreakingBannerSkeleton,
} from "@/components/breaking-banner";
import { HeroIntro } from "@/components/hero";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Featured stories, breaking news, and the latest from Vercel Daily.",
  openGraph: {
    title: "Vercel Daily — Home",
    description:
      "Featured stories, breaking news, and the latest from Vercel Daily.",
    type: "website",
  },
};

export default async function HomePage() {
  const articles = await getFeaturedArticles();
  const lead = articles[0];
  // masonry hero block
  const masonryBig = articles[1];
  const masonryStack = articles.slice(1, 6);

  return (
    <>
      {/* BreakingBanner uses a two-minute cache; isolating it in Suspense lets the
          rest of the page stream to the client immediately without waiting for it. */}
      <Suspense fallback={<BreakingBannerSkeleton />}>
        <BreakingBanner />
      </Suspense>

      <HeroIntro article={lead} />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-10 border-t border-border/70 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Featured
              </p>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Latest dispatches
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Handpicked reads from across product, engineering, and the web.
              </p>
            </div>
            <Link
              href="/search"
              className="group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
            >
              View all
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Masonry: big card left + 2 stacked right */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <ArticleCard article={masonryBig} variant="lead" />
          <div className="flex flex-col gap-6">
            {masonryStack.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
