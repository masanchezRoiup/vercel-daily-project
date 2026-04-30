import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold leading-tight">
        Article not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The story you&apos;re looking for may have been unpublished or moved.
      </p>
      <div className="mt-6">
        <Button asChild className="rounded-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
