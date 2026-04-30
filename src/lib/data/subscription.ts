import { cacheLife, cacheTag } from "next/cache";

import { fetchSubscription } from "@/lib/api/client";
import type { Subscription, SubscriptionStatus } from "@/lib/data/types";

export async function getSubscription(
  token: string,
): Promise<Subscription | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 60 });
  cacheTag(`subscription:${token}`);

  return fetchSubscription(token);
}

export async function getSubscriptionStatus(
  token: string,
): Promise<SubscriptionStatus> {
  const sub = await getSubscription(token);
  return sub?.status ?? "inactive";
}
