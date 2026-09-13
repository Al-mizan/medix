import { Loader2 } from "lucide-react"

export default function PatientMyReviewsLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-[#0B7285]" />
        <p className="text-sm text-muted-foreground">Loading your reviews...</p>
      </div>
    </div>
  )
}
