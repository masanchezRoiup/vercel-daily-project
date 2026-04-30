"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-4xl font-semibold leading-tight">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page.
        {error.digest ? (
          <>
            {" "}
            <span className="font-mono text-xs">({error.digest})</span>
          </>
        ) : null}
      </p>
      <div className="mt-6">
        <Button onClick={reset} className="rounded-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
