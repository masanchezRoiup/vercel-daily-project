import { cacheLife, cacheTag } from "next/cache";

import type { Article, BreakingNews } from "@/lib/data/types";
import {
  fetchArticleById,
  fetchArticleBySlug,
  fetchArticles,
  fetchBreaking,
  fetchTrending,
} from "@/lib/api/client";

export async function getFeaturedArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");

  const { articles } = await fetchArticles({ featured: "true" });
  return articles;
}

export async function getArticle(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("days");
  cacheTag("articles", `article:${slug}`);

  return fetchArticleBySlug(slug);
}

export async function getArticleSlugById(id: string): Promise<string | null> {
  "use cache";
  cacheLife("days");
  cacheTag("articles", `article-id:${id}`);

  const article = await fetchArticleById(id);
  return article?.slug ?? null;
}

export async function getTrending(): Promise<Article[]> {
  "use cache";
  cacheLife({ stale: 120, revalidate: 120, expire: 240 });
  cacheTag("trending");

  return fetchTrending();
}

export async function getBreaking(): Promise<BreakingNews> {
  "use cache";
  cacheLife({ stale: 120, revalidate: 120, expire: 240 });
  cacheTag("breaking");

  return fetchBreaking();
}

// No "use cache" here — search results are query-specific and must always reflect the latest data.
export async function searchArticles(
  opts: { q?: string; category?: string; limit?: number } = {},
): Promise<Article[]> {
  const { articles } = await fetchArticles({
    search: opts.q || undefined,
    category: opts.category || undefined,
    limit: opts.limit ?? 10,
  });
  return articles;
}

export async function listArticlesPage(
  opts: { page?: number; limit?: number } = {},
) {
  return fetchArticles({
    page: opts.page ?? 1,
    limit: opts.limit ?? 9,
  });
}
