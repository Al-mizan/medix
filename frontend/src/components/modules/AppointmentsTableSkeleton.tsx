import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface AppointmentsTableSkeletonProps {
  count?: number;
}

export function AppointmentsTableSkeleton({ count = 4 }: AppointmentsTableSkeletonProps) {
  return (
    <div
      data-testid="appointments-table-skeleton"
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 animate-in fade-in duration-200"
    >
      {/* Top Banner Skeleton */}
      <div className="rounded-2xl border bg-linear-to-r from-cyan-50/50 via-white to-blue-50/50 p-6 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Appointment Cards Grid Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={`appointment-skeleton-${index}`}
            className="border-neutral-200 shadow-xs dark:border-neutral-800"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <Skeleton className="h-4 w-56 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-3">
              <Skeleton className="h-5 w-24 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsTableSkeleton;
