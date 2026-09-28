import { Skeleton } from "@/components/ui/skeleton";
import DoctorListSkeleton from "@/components/modules/DoctorListSkeleton";

export default function ConsultationLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header and Search Filter Bar Skeleton */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <Skeleton className="h-9 w-72 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-96 mx-auto rounded-md" />
        <div className="flex gap-2 max-w-md mx-auto pt-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>

      {/* Specialty Filter Chips Skeleton */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>

      {/* Doctor Cards Grid Skeleton */}
      <DoctorListSkeleton count={6} />
    </div>
  );
}
