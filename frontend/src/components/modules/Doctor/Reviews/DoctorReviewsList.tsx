"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMyReviews } from "@/services/review.services"
import { ApiResponse } from "@/types/api.types"
import { IReview } from "@/types/review.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, MessageSquare, Search, Star } from "lucide-react"
import { useMemo, useState } from "react"

const getInitials = (name?: string) => {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating)
        return (
          <Star
            key={star}
            className={`size-4 ${
              isFilled
                ? "fill-[#E3A130] text-[#E3A130]"
                : "fill-neutral-200 text-neutral-300 dark:fill-neutral-800 dark:text-neutral-700"
            }`}
          />
        )
      })}
    </div>
  )
}

const DoctorReviewsList = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRating, setSelectedRating] = useState<string>("all")

  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
  })

  const reviews = (reviewsResponse as ApiResponse<IReview[]>)?.data ?? []

  // Metrics computation
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0"

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of reviews) {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 0))) as keyof typeof counts
      counts[rounded] = (counts[rounded] || 0) + 1
    }
    return counts
  }, [reviews])

  // Filtering
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        r.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRating =
        selectedRating === "all" ||
        Math.round(r.rating || 0) === Number(selectedRating)

      return matchesSearch && matchesRating
    })
  }, [reviews, searchTerm, selectedRating])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Patient Feedback & Reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          Read-only verified ratings and testimonials shared by your patients following completed consultations.
        </p>
      </div>

      {/* Overview Analytics Card */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {/* Average Rating Card */}
        <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-foreground">
                {averageRating}
              </span>
              <span className="text-sm font-medium text-muted-foreground">/ 5.0</span>
            </div>
            <StarRating rating={Number(averageRating)} />
            <p className="text-xs text-muted-foreground">
              Based on {totalReviews} patient review{totalReviews === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        {/* Rating Breakdown Bars */}
        <Card className="border-neutral-200 shadow-sm dark:border-neutral-800 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars as keyof typeof ratingCounts] || 0
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-muted-foreground flex items-center gap-1">
                    {stars} <Star className="size-3 fill-[#E3A130] text-[#E3A130]" />
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0B7285]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Controls: Search & Rating Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews by patient or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Ratings</SelectItem>
              <SelectItem value="5" className="text-xs">5 Stars</SelectItem>
              <SelectItem value="4" className="text-xs">4 Stars</SelectItem>
              <SelectItem value="3" className="text-xs">3 Stars</SelectItem>
              <SelectItem value="2" className="text-xs">2 Stars</SelectItem>
              <SelectItem value="1" className="text-xs">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="border-neutral-200 text-xs text-muted-foreground px-2.5 py-1">
            {filteredReviews.length} Review{filteredReviews.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Review Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          Loading patient reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-neutral-200 border-dashed shadow-sm dark:border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0B7285]/10 text-[#0B7285]">
              <MessageSquare className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No reviews found</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {reviews.length === 0
                ? "You haven't received any patient reviews yet. Reviews will appear here once patients complete consultations and share their feedback."
                : "No reviews match your filter criteria. Try clearing search filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {filteredReviews.map((review) => {
            const patient = review.patient
            const reviewDate = new Date(review.createdAt)
            const formattedDate = !Number.isNaN(reviewDate.getTime())
              ? format(reviewDate, "MMM dd, yyyy")
              : "N/A"

            return (
              <Card
                key={review.id}
                className="flex flex-col justify-between border-neutral-200 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-neutral-200 dark:border-neutral-700">
                        {patient?.profilePhoto && (
                          <AvatarImage src={patient.profilePhoto} alt={patient.name} />
                        )}
                        <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
                          {getInitials(patient?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {patient?.name ?? "Verified Patient"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Calendar className="size-3 text-muted-foreground" />
                          {formattedDate}
                        </CardDescription>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-xs text-foreground/90 leading-relaxed dark:border-neutral-800 dark:bg-neutral-900/40">
                    {review.comment ? (
                      <p className="italic">&ldquo;{review.comment}&rdquo;</p>
                    ) : (
                      <p className="italic text-muted-foreground">No written comment provided.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DoctorReviewsList
