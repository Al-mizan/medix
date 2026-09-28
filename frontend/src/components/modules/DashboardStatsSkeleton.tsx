import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardStatsSkeleton() {
  return (
    <div
      data-testid="dashboard-stats-skeleton"
      className="space-y-6 animate-in fade-in duration-200"
    >
      {/* 4 Metric Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={`stat-skeleton-${i}`}
            className="border-neutral-200 shadow-sm dark:border-neutral-800"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Data Section & Chart */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="border-neutral-200 shadow-sm lg:col-span-4 dark:border-neutral-800">
          <CardHeader className="space-y-2 pb-4">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm lg:col-span-3 dark:border-neutral-800">
          <CardHeader className="space-y-2 pb-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-52 rounded-md" />
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <Skeleton className="h-56 w-56 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardStatsSkeleton;
