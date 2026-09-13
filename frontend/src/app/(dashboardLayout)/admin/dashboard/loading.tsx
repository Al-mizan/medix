import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminsDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-60 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 bg-surface shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Charts and Management Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/80 bg-surface shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <Skeleton className="size-48 rounded-full" />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/15">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-40 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
