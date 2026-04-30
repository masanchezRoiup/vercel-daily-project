import { cacheLife, cacheTag } from "next/cache";

import { fetchCategories } from "@/lib/api/client";
import type { Category } from "@/lib/data/types";

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  return fetchCategories();
}
