import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { listArticlesPage, searchArticles } from "@/lib/data/articles";
import { getCategories } from "@/lib/data/categories";
import { ArticleCard } from "@/components/article-card";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search articles, authors, and topics across Vercel Daily.",
  openGraph: {
    title: "Search · Vercel Daily",
    description:
      "Search articles, authors, and topics across Vercel Daily.",
    type: "website",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q: rawQ = "", category = "", page = "1" } = await searchParams;
  const q = rawQ.trim();
  const currentPage = Number.parseInt(page, 10);
  const safePage = Number.isFinite(currentPage) && currentPage > 0
    ? currentPage
    : 1;
  const hasFilters = Boolean(q || category);
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 max-w-5xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Archive
        </p>
        <h1 className="mb-5 mt-2 max-w-[calc(100vw-2rem)] break-words font-heading text-4xl font-semibold leading-tight tracking-tight sm:max-w-5xl sm:text-6xl sm:leading-none">
          Search the newsroom
        </h1>
        <SearchForm
          key={`${q}|${category}`}
          defaultValue={q}
          defaultCategory={category}
          categories={categories}
        />
      </div>

      {/* key forces a full remount whenever the query, category, or page changes, immediately
          showing the skeleton and re-suspending so the user sees a fresh loading state. */}
      <Suspense
        key={`${q}|${category}|${safePage}`}
        fallback={<ResultsSkeleton count={hasFilters ? 5 : 9} />}
      >
        <Results
          q={q}
          category={category}
          page={safePage}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}

async function Results({
  q,
  category,
  page,
  categories,
}: {
  q: string;
  category: string;
  page: number;
  categories: { slug: string; name: string }[];
}) {
  const hasFilters = Boolean(q || category);
  const pageSize = hasFilters ? 5 : 9;
  const { articles: results, pagination } = hasFilters
    ? { articles: await searchArticles({ q, category, limit: pageSize }) }
    : await listArticlesPage({ page, limit: pageSize });

  const categoryLabel = category
    ? categories.find((c) => c.slug === category)?.name ?? category
    : "";

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center shadow-[0_18px_50px_oklch(0.18_0.008_260/0.05)]">
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          {q || category
            ? "No articles matched your filters. Try a different query or clear the category."
            : "No articles available right now."}
        </p>
      </div>
    );
  }

  let label: string;
  if (!hasFilters) {
    label = pagination
      ? `All articles · ${pagination.total} total · page ${pagination.page} of ${pagination.totalPages}`
      : `All articles · ${results.length}`;
  } else if (q && !category) {
    label = results.length === pageSize
      ? `First ${pageSize} results for "${q}"`
      : `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`;
  } else if (!q && category) {
    label = results.length === pageSize
      ? `First ${pageSize} articles in ${categoryLabel}`
      : `${results.length} article${results.length === 1 ? "" : "s"} in ${categoryLabel}`;
  } else {
    label = results.length === pageSize
      ? `First ${pageSize} results for "${q}" in ${categoryLabel}`
      : `${results.length} result${results.length === 1 ? "" : "s"} for "${q}" in ${categoryLabel}`;
  }

  return (
    <>
      <p className="mb-6 inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <section className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
      {!hasFilters && pagination ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
        />
      ) : null}
    </>
  );
}

function PaginationControls({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Articles pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6"
    >
      {hasPreviousPage ? (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={page - 1 === 1 ? "/search" : `/search?page=${page - 1}`}>
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled className="rounded-full">
          Previous
        </Button>
      )}
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {hasNextPage ? (
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/search?page=${page + 1}`}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" disabled className="rounded-full">
          Next
        </Button>
      )}
    </nav>
  );
}

function ResultsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
