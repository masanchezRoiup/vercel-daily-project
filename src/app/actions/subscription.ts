// "use server" marks this module as a Server Actions boundary — these functions run on the server
// and are callable directly from client components via form actions or event handlers.
"use server";

import { updateTag } from "next/cache";

import {
  ApiError,
  activateSubscription,
  createSubscription,
  deactivateSubscription,
} from "@/lib/api/client";
import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from "@/lib/session";

export type ActionState = { ok: boolean; error?: string };

async function activateOrRecreate(existingToken: string | null): Promise<string> {
  if (existingToken) {
    try {
      await activateSubscription(existingToken);
      return existingToken;
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 404) throw err;
    }
  }

  const created = await createSubscription();
  await setSessionToken(created.token);
  await activateSubscription(created.token);
  return created.token;
}

export async function subscribe(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _prev;
  void _formData;

  try {
    const existing = await getSessionToken();
    const token = await activateOrRecreate(existing);
    updateTag(`subscription:${token}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.message
          : "Could not subscribe. Try again.",
    };
  }
}

export async function unsubscribe(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _prev;
  void _formData;

  try {
    const token = await getSessionToken();
    if (token) {
      try {
        await deactivateSubscription(token);
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 404) throw err;
      }
      updateTag(`subscription:${token}`);
    }
    await clearSessionToken();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.message
          : "Could not unsubscribe. Try again.",
    };
  }
}
