"use client";

import { Button } from "@/components/ui/button";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-4xl font-semibold leading-tight">
        Could not load article
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We hit an error while fetching this story.
        {error.digest ? (
          <>
            {" "}
            <span className="font-mono text-xs">({error.digest})</span>
          </>
        ) : null}
      </p>
      <div className="mt-6">
        <Button onClick={reset} className="rounded-full">
          Retry
        </Button>
      </div>
    </div>
  );
}
