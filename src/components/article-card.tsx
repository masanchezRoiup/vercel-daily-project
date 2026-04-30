import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Article } from "@/lib/data/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  categoryBadgeClass,
  categoryDotClass,
  formatCategory,
} from "@/lib/category-style";
import { cn } from "@/lib/utils";

type ArticleCardVariant = "standard" | "lead" | "compact";

function formatArticleDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ArticleMeta({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      <span
        className={categoryBadgeClass(
          article.category,
          "inline-flex min-w-0 items-center gap-1 rounded-full border px-2 py-0.5",
        )}
      >
        <span className={categoryDotClass(article.category, "size-1 rounded-full")} />
        <span className="truncate">{formatCategory(article.category)}</span>
      </span>
      <time dateTime={article.publishedAt} className="font-mono tabular-nums">
        {formatArticleDate(article.publishedAt)}
      </time>
    </div>
  );
}

export function ArticleCard({
  article,
  variant = "standard",
  priority = false,
}: {
  article: Article;
  variant?: ArticleCardVariant;
  priority?: boolean;
}) {
  if (variant === "lead") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group grid h-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_70px_oklch(0.18_0.008_260/0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
      >
        <div className="flex min-w-0 flex-col justify-between gap-8 p-5 sm:p-8">
          <div className="min-w-0 space-y-5">
            <ArticleMeta article={article} />
            <div className="space-y-4">
              <h2 className="max-w-[calc(100vw-4rem)] break-words font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:max-w-2xl sm:text-5xl lg:text-6xl lg:leading-[0.95]">
                {article.title}
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {article.excerpt}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-4 text-sm">
            <span className="min-w-0 truncate text-muted-foreground">
              by {article.author.name}
            </span>
            <span className="hidden shrink-0 items-center gap-1 font-semibold sm:inline-flex">
              Read lead
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
        <div className="relative min-h-72 overflow-hidden bg-muted sm:min-h-96 lg:min-h-full">
          <Image
            src={article.image}
            alt=""
            fill
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent,oklch(0.18_0.008_260/0.12))]"
          />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-xl border border-border/70 bg-card/80 p-2.5 shadow-sm transition-all duration-200 hover:border-foreground/15 hover:bg-card hover:shadow-md sm:grid-cols-[6.5rem_minmax(0,1fr)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 space-y-2 py-1">
          <ArticleMeta article={article} className="[&>span]:max-w-full" />
          <h3 className="line-clamp-2 wrap-break-word font-heading text-lg font-semibold leading-snug text-foreground group-hover:underline">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full min-w-0 flex-col gap-3 transition-[filter] duration-300 hover:drop-shadow-sm"
    >
      <AspectRatio
        ratio={16 / 10}
        className="overflow-hidden rounded-xl border border-border/80 bg-muted transition-colors group-hover:border-foreground/20"
      >
        <Image
          src={article.image}
          alt=""
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </AspectRatio>
      <ArticleMeta article={article} />
      <h3 className="max-w-[calc(100vw-2rem)] wrap-break-word font-heading text-xl font-semibold leading-tight text-foreground group-hover:underline sm:max-w-none sm:text-2xl">
        {article.title}
      </h3>
      <p className="line-clamp-3 text-sm text-muted-foreground">
        {article.excerpt}
      </p>
    </Link>
  );
}
