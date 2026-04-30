"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

import type { Category } from "@/lib/data/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEBOUNCE_MS = 400;
const MIN_AUTO_CHARS = 3;
const ALL_CATEGORIES = "__all__";

function buildHref(q: string, category: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function SearchForm({
  defaultValue = "",
  defaultCategory = "",
  categories,
}: {
  defaultValue?: string;
  defaultCategory?: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [category, setCategory] = useState(defaultCategory);
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const go = (nextQ: string, nextCategory: string) => {
    startTransition(() => {
      router.replace(buildHref(nextQ, nextCategory));
    });
  };

  // Auto-search: fires after 400ms of inactivity when the query is empty (clear/reset) or ≥ 3 chars.
  const onQueryChange = (next: string) => {
    setQ(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = next.trim();
    if (trimmed.length === 0 || trimmed.length >= MIN_AUTO_CHARS) {
      timerRef.current = setTimeout(() => go(trimmed, category), DEBOUNCE_MS);
    }
  };

  const onCategoryChange = (next: string) => {
    const actual = next === ALL_CATEGORIES ? "" : next;
    setCategory(actual);
    if (timerRef.current) clearTimeout(timerRef.current);
    go(q.trim(), actual);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    go(q.trim(), category);
  };

  return (
    <form
      action="/search"
      method="get"
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-[0_18px_50px_oklch(0.18_0.008_260/0.06)] sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center"
    >
      <div className="relative flex-1">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          name="q"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search articles, authors, topics…"
          aria-label="Search articles"
          className={
            pending
              ? "h-12 rounded-full bg-background pl-11 pr-10 ring-2 ring-ring/40"
              : "h-12 rounded-full bg-background pl-11 pr-10"
          }
        />
        {pending ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground"
          />
        ) : null}
      </div>
      <Select
        value={category || ALL_CATEGORIES}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger
          aria-label="Filter by category"
          className="h-12 w-full rounded-full bg-background px-4 sm:w-48"
        >
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Mirrors the Select value into a real form field so a native GET submission (Enter key)
          still includes the category in the URL even though shadcn Select is client-only. */}
      <input type="hidden" name="category" value={category} />
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 rounded-full px-5"
      >
        {pending ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
