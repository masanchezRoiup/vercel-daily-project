import { cacheLife } from "next/cache";

// Cached async Server Component — the year is stable for a full day.
// Wrapped in Suspense in layout.tsx to satisfy the Cache Components dynamic-read boundary.
export async function FooterYear() {
  "use cache";
  cacheLife("days");

  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
