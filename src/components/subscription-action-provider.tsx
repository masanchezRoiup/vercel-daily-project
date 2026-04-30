"use client";

import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  subscribe,
  unsubscribe,
  type ActionState,
} from "@/app/actions/subscription";

const initialState: ActionState = { ok: false };

type SubscriptionMode = "subscribe" | "unsubscribe";
type FormAction = (formData: FormData) => void;

type SubscriptionActionContextValue = {
  subscribeAction: FormAction;
  unsubscribeAction: FormAction;
  pendingMode: SubscriptionMode | null;
};

const SubscriptionActionContext =
  createContext<SubscriptionActionContextValue | null>(null);

export function SubscriptionActionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [subscribeState, subscribeAction, subscribePending] = useActionState(
    subscribe,
    initialState,
  );
  const [unsubscribeState, unsubscribeAction, unsubscribePending] =
    useActionState(unsubscribe, initialState);

  const pendingMode: SubscriptionMode | null = subscribePending
    ? "subscribe"
    : unsubscribePending
      ? "unsubscribe"
      : null;

  const prevSubscribeStateRef = useRef<ActionState>(initialState);
  useEffect(() => {
    if (subscribeState === prevSubscribeStateRef.current) return;
    prevSubscribeStateRef.current = subscribeState;

    if (subscribeState.ok) {
      toast.success("Subscribed to Vercel Daily");
      router.refresh();
    } else if (subscribeState.error) {
      toast.error(subscribeState.error);
    }
  }, [subscribeState, router]);

  const prevUnsubscribeStateRef = useRef<ActionState>(initialState);
  useEffect(() => {
    if (unsubscribeState === prevUnsubscribeStateRef.current) return;
    prevUnsubscribeStateRef.current = unsubscribeState;

    if (unsubscribeState.ok) {
      toast.success("Unsubscribed from Vercel Daily");
      router.refresh();
    } else if (unsubscribeState.error) {
      toast.error(unsubscribeState.error);
    }
  }, [unsubscribeState, router]);

  const value = useMemo(
    () => ({
      subscribeAction,
      unsubscribeAction,
      pendingMode,
    }),
    [subscribeAction, unsubscribeAction, pendingMode],
  );

  return (
    <SubscriptionActionContext value={value}>
      {children}
    </SubscriptionActionContext>
  );
}

export function useSubscriptionAction() {
  const context = useContext(SubscriptionActionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionAction must be used within SubscriptionActionProvider",
    );
  }
  return context;
}
