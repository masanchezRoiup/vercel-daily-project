import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="rounded-2xl border border-border/70 bg-card/75 p-5 sm:p-8">
          <Skeleton className="mb-6 h-3 w-32" />
          <Skeleton className="mb-4 h-14 w-full max-w-lg" />
          <Skeleton className="mb-8 h-14 w-3/4" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
        <Skeleton className="min-h-96 rounded-2xl" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
