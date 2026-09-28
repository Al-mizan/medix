import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface DoctorListSkeletonProps {
  count?: number;
}

export function DoctorListSkeleton({ count = 6 }: DoctorListSkeletonProps) {
  return (
    <div
      data-testid="doctor-list-skeleton"
      className="space-y-6 animate-in fade-in duration-200"
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={`doctor-skeleton-${index}`}
            className="overflow-hidden border border-border/70 bg-card shadow-xs flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-3.5 w-2/3 rounded-md" />
                </div>
              </div>

              {/* Specialty Badges Placeholder */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              {/* Stats / Fee strip Placeholder */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </CardContent>

            <div className="border-t border-border/50 p-4 bg-muted/20 flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default DoctorListSkeleton;
