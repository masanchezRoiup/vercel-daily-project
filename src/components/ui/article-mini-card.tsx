import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/lib/data/types";
import { Skeleton } from "@/components/ui/skeleton";

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function AuthorAvatar({
  name,
  src,
}: {
  name: string | null | undefined;
  src?: string | null;
}) {
  const avatarSrc = nonEmpty(src);
  const initial = nonEmpty(name)?.charAt(0).toUpperCase() ?? "V";

  if (!avatarSrc) {
    return (
      <span
        aria-hidden
        className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6rem] font-semibold text-muted-foreground"
      >
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={avatarSrc}
      alt=""
      width={18}
      height={18}
      className="size-4.5 rounded-full bg-muted object-cover"
    />
  );
}

export function ArticleMiniCard({
  article,
  index,
}: {
  article: Article;
  index: number;
}) {
  const authorName = nonEmpty(article.author.name) ?? "Vercel Daily";
  const imageSrc = nonEmpty(article.image);

  return (
    <article className="rounded-xl border border-border/70 bg-background/70 transition-colors hover:border-foreground/20">
      <Link
        href={`/articles/${article.slug}`}
        className="group grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-2.5"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="96px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <span className="absolute left-2 top-2 rounded-full bg-background/92 px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tabular-nums text-foreground shadow-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="min-w-0 space-y-2">
          <h3 className="line-clamp-2 break-words font-heading text-base font-semibold leading-tight text-foreground group-hover:underline">
            {article.title}
          </h3>
          {article.excerpt ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}
          <div className="flex min-w-0 items-center gap-2 font-mono text-[0.68rem] text-muted-foreground">
            <AuthorAvatar
              name={authorName}
              src={article.author.avatar}
            />
            <span className="line-clamp-1">{authorName}</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ArticleMiniCardSkeleton() {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-xl border border-border/70 bg-background/70 p-2.5">
      <Skeleton className="aspect-[4/3] w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
