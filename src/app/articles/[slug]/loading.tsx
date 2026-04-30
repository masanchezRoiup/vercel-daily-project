import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <Skeleton className="mb-3 h-4 w-48" />
        <Skeleton className="mb-3 h-16 w-full max-w-3xl" />
        <Skeleton className="mb-8 h-6 w-2/3 max-w-2xl" />
        <Skeleton className="mb-8 aspect-[16/9] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
