import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Article } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/components/subscribe-button";
import { ArticleCard } from "@/components/article-card";

export function HeroIntro({ article }: { article?: Article }) {
  return (
    <section
      aria-label="Vercel Daily"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16"
    >
      {/* Top: editorial heading + CTAs */}
      <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:mb-12">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          The Vercel Daily · Est. 2024
        </p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="max-w-[calc(100vw-4rem)] wrap-break-word font-heading text-5xl font-semibold leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:max-w-3xl lg:text-7xl xl:text-8xl">
            The newsroom for teams shipping the modern web.
          </h1>
          <div className="flex flex-col gap-4 lg:shrink-0 lg:items-end lg:pb-1">
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground lg:text-right">
              Product updates, engineering reads, customer stories, and
              community signals curated for builders who ship.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-5 gap-2">
                <Link href="/search">
                  Browse archive
                  <ArrowRight />
                </Link>
              </Button>
              <SubscribeButton mode="subscribe" variant="outline" size="lg">
                Join the brief
              </SubscribeButton>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-border/60" />
      </div>

      {/* Bottom: lead article full-width */}
      {article ? (
        <ArticleCard article={article} variant="lead" priority />
      ) : (
        <div className="min-h-80 rounded-2xl border border-dashed border-border bg-card/60" />
      )}
    </section>
  );
}
