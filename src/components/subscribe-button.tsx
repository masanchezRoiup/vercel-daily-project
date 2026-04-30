"use client";

import { Bell, BellRing } from "lucide-react";

import { useSubscriptionAction } from "@/components/subscription-action-provider";
import { Button } from "@/components/ui/button";

export function SubscribeButton({
  mode,
  variant = "default",
  size = "default",
  fullWidth = false,
  children,
  showIcon = true,
}: {
  mode: "subscribe" | "unsubscribe";
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
  children?: React.ReactNode;
  showIcon?: boolean;
}) {
  const { subscribeAction, unsubscribeAction, pendingMode } =
    useSubscriptionAction();
  const formAction = mode === "subscribe" ? subscribeAction : unsubscribeAction;
  const pending = pendingMode !== null;
  const isCurrentActionPending = pendingMode === mode;

  const defaultLabel = mode === "subscribe" ? "Subscribe" : "Unsubscribe";
  const pendingLabel = mode === "subscribe" ? "Subscribing…" : "Unsubscribing…";

  const Icon = mode === "subscribe" ? Bell : BellRing;

  return (
    <form action={formAction} className={fullWidth ? "w-full" : undefined}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        className={fullWidth ? "w-full" : undefined}
      >
        {showIcon ? <Icon className="mr-1" aria-hidden /> : null}
        {isCurrentActionPending ? pendingLabel : (children ?? defaultLabel)}
      </Button>
    </form>
  );
}
