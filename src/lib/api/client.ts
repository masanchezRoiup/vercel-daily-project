import "server-only";

import type {
  Article,
  BreakingNews,
  Category,
  PaginationMeta,
  Subscription,
} from "@/lib/data/types";

const BASE_URL = process.env.NEWS_API_BASE_URL;
const BYPASS_TOKEN = process.env.NEWS_API_BYPASS_TOKEN;

if (!BASE_URL) {
  throw new Error("NEWS_API_BASE_URL is not set");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Envelope<T> = {
  success: true;
  data: T;
  meta?: { pagination?: PaginationMeta };
};

type ErrorEnvelope = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

type RequestOptions = RequestInit & {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
};

async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ data: T; meta?: Envelope<T>["meta"]; response: Response }> {
  const { token, query, headers, ...init } = opts;

  const url = new URL(`${BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      const isEmpty = value === undefined || value === null || value === "";
      if (!isEmpty) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const finalHeaders = new Headers(headers);
  if (BYPASS_TOKEN) {
    finalHeaders.set("x-vercel-protection-bypass", BYPASS_TOKEN);
  }
  if (token) {
    finalHeaders.set("x-subscription-token", token);
  }

  const res = await fetch(url, { ...init, headers: finalHeaders });
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new ApiError(
      `Expected JSON from ${path}, got ${contentType || "nothing"}`,
      res.status,
    );
  }

  const body = (await res.json()) as Envelope<T> | ErrorEnvelope;
  if (!body.success) {
    throw new ApiError(body.error.message, res.status, body.error.code);
  }

  return { data: body.data, meta: body.meta, response: res };
}

export type ListArticlesParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: "true" | "false";
};

export async function fetchArticles(
  params: ListArticlesParams = {},
): Promise<{ articles: Article[]; pagination?: PaginationMeta }> {
  const { data, meta } = await apiFetch<Article[]>("/articles", {
    query: params,
  });
  return { articles: data, pagination: meta?.pagination };
}

async function fetchArticleByParam(param: string): Promise<Article | null> {
  try {
    const { data } = await apiFetch<Article>(
      `/articles/${encodeURIComponent(param)}`,
    );
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  return fetchArticleByParam(slug);
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  return fetchArticleByParam(id);
}

export async function fetchTrending(exclude?: string[]): Promise<Article[]> {
  const { data } = await apiFetch<Article[]>("/articles/trending", {
    query: exclude && exclude.length ? { exclude: exclude.join(",") } : undefined,
  });
  return data;
}

export async function fetchBreaking(): Promise<BreakingNews> {
  const { data } = await apiFetch<BreakingNews>("/breaking-news");
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiFetch<Category[]>("/categories");
  return data;
}

export async function createSubscription(): Promise<{
  token: string;
  subscription: Subscription;
}> {
  const { data, response } = await apiFetch<Subscription>(
    "/subscription/create",
    { method: "POST" },
  );
  const token =
    response.headers.get("x-subscription-token") ?? data.token;
  if (!token) {
    throw new ApiError(
      "No subscription token returned from create endpoint",
      500,
    );
  }
  return { token, subscription: data };
}

export async function activateSubscription(token: string): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>("/subscription", {
    method: "POST",
    token,
  });
  return data;
}

export async function deactivateSubscription(
  token: string,
): Promise<Subscription> {
  const { data } = await apiFetch<Subscription>("/subscription", {
    method: "DELETE",
    token,
  });
  return data;
}

export async function fetchSubscription(
  token: string,
): Promise<Subscription | null> {
  try {
    const { data } = await apiFetch<Subscription>("/subscription", { token });
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
