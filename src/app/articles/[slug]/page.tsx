import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getArticle } from "@/lib/data/articles";
import { isSubscribed } from "@/lib/session";
import { firstParagraph, readMinutes } from "@/lib/utils/read-minutes";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleContent } from "@/components/article-content";
import { PaywallGate } from "@/components/paywall";
import {
  TrendingSidebar,
  TrendingSidebarSkeleton,
} from "@/components/trending-sidebar";
import {
  categoryBadgeClass,
  categoryDotClass,
  formatCategory,
} from "@/lib/category-style";
import type { Article } from "@/lib/data/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return { title: "Article not found" };
  }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

// Resolves subscription status and renders either the paywall CTA or the full article body.
// Header, image, and teaser are rendered by ArticlePage above this boundary — no duplication.
async function ArticleGate({ article }: { article: Article }) {
  const subscribed = await isSubscribed();
  if (!subscribed) return <PaywallGate />;
  // Skip the first paragraph block — already rendered as teaser above the Suspense boundary.
  const firstParaIdx = article.content.findIndex((b) => b.type === "paragraph");
  const bodyBlocks = firstParaIdx === -1 ? article.content : article.content.filter((_, i) => i !== firstParaIdx);
  return (
    <div className="max-w-3xl">
      <ArticleContent blocks={bodyBlocks} />
    </div>
  );
}

function ArticleContentSkeleton() {
  return (
    <div className="max-w-3xl space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const minutes = readMinutes(article.content);
  const teaser = firstParagraph(article.content) ?? article.excerpt;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="min-w-0">
        <header className="mb-8 max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Badge
              variant="outline"
              className={categoryBadgeClass(
                article.category,
                "gap-1.5 rounded-full border px-2.5 py-1",
              )}
            >
              <span className={categoryDotClass(article.category, "size-1.5 rounded-full")} />
              {formatCategory(article.category)}
            </Badge>
            <span className="font-mono">{minutes} min read</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt} className="font-mono tabular-nums">
              {new Date(article.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <h1 className="max-w-[calc(100vw-2rem)] wrap-break-word font-heading text-4xl font-semibold leading-tight tracking-tight sm:max-w-4xl sm:text-6xl sm:leading-[0.98]">
            {article.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {article.excerpt}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            by {article.author.name}
          </p>
        </header>

        <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-[0_22px_65px_oklch(0.18_0.008_260/0.08)]">
          <Image
            src={article.image}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 680px, 100vw"
            className="object-cover"
          />
        </div>

        <p className="mb-8 max-w-3xl text-lg leading-8 text-foreground">{teaser}</p>

        <Suspense fallback={<ArticleContentSkeleton />}>
          <ArticleGate article={article} />
        </Suspense>
      </article>

      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <Suspense fallback={<TrendingSidebarSkeleton />}>
          <TrendingSidebar />
        </Suspense>
      </div>
    </div>
  );
}
