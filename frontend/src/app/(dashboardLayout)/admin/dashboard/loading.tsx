import DashboardStatsSkeleton from "@/components/modules/DashboardStatsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminsDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-60 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      <DashboardStatsSkeleton />
    </div>
  );
}
