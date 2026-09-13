"use client"

import { revalidateReviewsAction } from "@/app/(dashboardLayout)/dashboard/my-reviews/_action"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteReview, getMyReviews } from "@/services/review.services"
import { type ApiResponse } from "@/types/api.types"
import { type IReview } from "@/types/review.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, Edit3, Loader2, MessageSquare, Search, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import EditReviewDialog from "./EditReviewDialog"

const getDoctorInitials = (name?: string) => {
  if (!name) return "DR"
  const cleaned = name.replace(/^Dr\.\s*/i, "").trim()
  const parts = cleaned.split(" ")
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

export const PatientReviewsList = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [editingReview, setEditingReview] = useState<IReview | null>(null)
  const [deletingReview, setDeletingReview] = useState<IReview | null>(null)

  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
  })

  const reviews = (reviewsResponse as ApiResponse<IReview[]>)?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: async () => {
      toast.success("Review deleted successfully")
      await queryClient.invalidateQueries({ queryKey: ["my-reviews"] })
      await queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      await revalidateReviewsAction()
      router.refresh()
      setDeletingReview(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete review"
      toast.error(message)
    },
  })

  const totalReviews = reviews.length
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
      : "0.0"

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        r.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRating =
        selectedRating === "all" ||
        Math.round(r.rating || 0) === Number(selectedRating)

      return matchesSearch && matchesRating
    })
  }, [reviews, searchTerm, selectedRating])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-linear-to-r from-teal-50 via-white to-cyan-50 p-6 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 dark:border-neutral-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              My Doctor Reviews
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your ratings and testimonials provided for completed consultations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              Total Reviews: {totalReviews}
            </Badge>
            {totalReviews > 0 && (
              <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                Avg Rating Given: {averageRating} / 5.0
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Controls: Search & Rating Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by doctor or comments..."
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

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-[#0B7285] mb-2" />
          Loading your reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-dashed border-neutral-200 shadow-sm dark:border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0B7285]/10 text-[#0B7285]">
              <MessageSquare className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {reviews.length === 0 ? "No reviews written yet" : "No matching reviews found"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {reviews.length === 0
                ? "Once you complete an appointment, you can share feedback on your doctor consultation to help others and support quality healthcare."
                : "No reviews match your current search and filter selections. Try clearing your search term or choosing 'All Ratings'."}
            </p>
            {reviews.length === 0 && (
              <Button asChild className="mt-4 bg-[#0B7285] hover:bg-[#095E70] text-white" size="sm">
                <Link href="/dashboard/my-appointments">View Appointments</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {filteredReviews.map((review) => {
            const doctor = review.doctor
            const reviewDate = review.createdAt ? new Date(review.createdAt) : null
            const formattedDate = reviewDate && !Number.isNaN(reviewDate.getTime())
              ? format(reviewDate, "MMM dd, yyyy")
              : "N/A"

            return (
              <Card
                key={review.id}
                className="flex flex-col justify-between border-neutral-200 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 border border-neutral-200 dark:border-neutral-700">
                        {doctor?.profilePhoto && (
                          <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
                        )}
                        <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
                          {getDoctorInitials(doctor?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {doctor?.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor?.name || "Consultant"}`}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Calendar className="size-3 text-muted-foreground" />
                          Consulted {formattedDate}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StarRating rating={review.rating} />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {review.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-xs text-foreground/90 leading-relaxed dark:border-neutral-800 dark:bg-neutral-900/40">
                    {review.comment ? (
                      <p className="italic">&ldquo;{review.comment}&rdquo;</p>
                    ) : (
                      <p className="italic text-muted-foreground">No written comment provided.</p>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReview(review)}
                      className="gap-1.5 text-xs"
                    >
                      <Edit3 className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingReview(review)}
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Review Dialog */}
      <EditReviewDialog
        open={!!editingReview}
        onOpenChange={(open) => {
          if (!open) setEditingReview(null)
        }}
        review={editingReview}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingReview}
        onOpenChange={(open) => {
          if (!open) setDeletingReview(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone and will recalculate the doctor&apos;s average rating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deletingReview?.id) {
                  deleteMutation.mutate(deletingReview.id)
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Review"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PatientReviewsList
