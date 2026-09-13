import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ChangePasswordLoading() {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-52 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      <Card className="border-border/80 bg-surface shadow-xs">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
