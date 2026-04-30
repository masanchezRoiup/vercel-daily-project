import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { badge: string; dot: string }> = {
  changelog: {
    badge: "border-amber-300/70 bg-amber-100/70 text-amber-950",
    dot: "bg-amber-500",
  },
  engineering: {
    badge: "border-sky-300/70 bg-sky-100/70 text-sky-950",
    dot: "bg-sky-500",
  },
  customers: {
    badge: "border-emerald-300/70 bg-emerald-100/70 text-emerald-950",
    dot: "bg-emerald-500",
  },
  "company-news": {
    badge: "border-stone-300/80 bg-stone-100/80 text-stone-950",
    dot: "bg-stone-500",
  },
  community: {
    badge: "border-cyan-300/80 bg-cyan-100/70 text-cyan-950",
    dot: "bg-cyan-500",
  },
};

const FALLBACK_STYLE = {
  badge: "border-border bg-secondary text-secondary-foreground",
  dot: "bg-accent-brand",
};

export function formatCategory(category: string): string {
  return category.replace(/-/g, " ");
}

export function categoryBadgeClass(category: string, className?: string) {
  return cn(CATEGORY_STYLES[category]?.badge ?? FALLBACK_STYLE.badge, className);
}

export function categoryDotClass(category: string, className?: string) {
  return cn(CATEGORY_STYLES[category]?.dot ?? FALLBACK_STYLE.dot, className);
}
