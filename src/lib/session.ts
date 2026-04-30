import "server-only";

import { cookies } from "next/headers";

import { getSubscriptionStatus } from "@/lib/data/subscription";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export { SESSION_COOKIE } from "@/lib/session-cookie";

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Reads the anonymous cookie token and checks its status via the short-cached API call — no JWT, no auth.
export async function isSubscribed(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;
  const status = await getSubscriptionStatus(token);
  return status === "active";
}
