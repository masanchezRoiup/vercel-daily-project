import Image from "next/image";

import type { Article } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SubscribeButton } from "@/components/subscribe-button";
import { firstParagraph, readMinutes } from "@/lib/utils/read-minutes";
import {
  categoryBadgeClass,
  categoryDotClass,
  formatCategory,
} from "@/lib/category-style";

export function Paywall({ article }: { article: Article }) {
  const teaser = firstParagraph(article.content) ?? article.excerpt;
  const minutes = readMinutes(article.content);

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
          <time dateTime={article.publishedAt} className="font-mono tabular-nums">
            {new Date(article.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden>·</span>
          <span className="font-mono">{minutes} min read</span>
        </div>
        <h1 className="max-w-[calc(100vw-2rem)] break-words font-heading text-4xl font-semibold leading-tight tracking-tight sm:max-w-3xl sm:text-6xl sm:leading-[0.98]">
          {article.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {article.excerpt}
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          by {article.author.name}
        </p>
      </header>

      <AspectRatio
        ratio={16 / 9}
        className="mb-8 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-[0_22px_65px_oklch(0.18_0.008_260/0.08)]"
      >
        <Image
          src={article.image}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
        />
      </AspectRatio>

      <p className="text-lg leading-8 text-foreground">{teaser}</p>

      <div className="relative mt-2">
        <div
          aria-hidden
          className="h-24 bg-gradient-to-b from-transparent to-background"
        />
        <Card className="border-border/70 bg-foreground text-background shadow-[0_22px_65px_oklch(0.18_0.008_260/0.12)]">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
            <Badge
              variant="secondary"
              className="rounded-full bg-accent-brand text-accent-brand-foreground"
            >
              Subscribers only
            </Badge>
            <h2 className="max-w-lg font-heading text-3xl font-semibold leading-tight">
              Keep reading with Vercel Daily
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-background/70">
              Subscribe to unlock the full article and every premium story on
              the site. Free, no account, persists for this browser session.
            </p>
            <div className="mt-2">
              <SubscribeButton mode="subscribe" size="lg" variant="secondary">
                Subscribe to continue
              </SubscribeButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
