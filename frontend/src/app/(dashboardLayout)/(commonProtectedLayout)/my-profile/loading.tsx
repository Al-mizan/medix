import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MyProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      <Card className="border-border/80 bg-surface shadow-xs">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-4 w-56 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
