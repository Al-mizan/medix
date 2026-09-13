"use client"

import { revalidateReviewsAction } from "@/app/(dashboardLayout)/dashboard/my-reviews/_action"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateReview } from "@/services/review.services"
import { type IReview } from "@/types/review.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, Loader2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

interface EditReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: IReview | null
  onSuccess?: () => void
}

const editReviewZodSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select at least 1 star.")
    .max(5, "Rating cannot exceed 5 stars."),
  comment: z
    .string()
    .trim()
    .min(3, "Please enter a comment with at least 3 characters.")
    .max(1000, "Comment cannot exceed 1000 characters."),
})

const getDoctorInitials = (name?: string) => {
  if (!name) return "DR"
  const cleaned = name.replace(/^Dr\.\s*/i, "").trim()
  const parts = cleaned.split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Poor experience",
  2: "Fair experience",
  3: "Good experience",
  4: "Very good experience",
  5: "Excellent care",
}

interface EditReviewFormInnerProps {
  review: IReview
  onClose: () => void
  onSuccess?: () => void
}

const EditReviewFormInner = ({
  review,
  onClose,
  onSuccess,
}: EditReviewFormInnerProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: { rating?: number; comment?: string }) =>
      updateReview(review.id, payload),
  })

  const form = useForm({
    defaultValues: {
      rating: Math.min(5, Math.max(1, Math.round(review.rating || 5))),
      comment: review.comment || "",
    },
    onSubmit: async ({ value }) => {
      const parsed = editReviewZodSchema.safeParse(value)
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Please fix validation errors."
        toast.error(errorMsg)
        return
      }

      try {
        const response = await mutation.mutateAsync({
          rating: value.rating,
          comment: value.comment.trim(),
        })

        if (!response?.success && !response?.data) {
          toast.error(response?.message || "Failed to update review")
          return
        }

        toast.success("Review updated successfully!")
        await queryClient.invalidateQueries({ queryKey: ["my-reviews"] })
        await queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
        await queryClient.invalidateQueries({ queryKey: ["appointments"] })
        await revalidateReviewsAction()
        router.refresh()
        onSuccess?.()
        onClose()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update review"
        toast.error(message)
      }
    },
  })

  const doctor = review.doctor
  const reviewDate = review.createdAt ? new Date(review.createdAt) : null
  const formattedDate = reviewDate && !Number.isNaN(reviewDate.getTime())
    ? format(reviewDate, "MMM dd, yyyy")
    : null

  return (
    <>
      {/* Doctor Summary Context */}
      <div className="flex items-center gap-3 border-b bg-slate-50/50 px-6 py-3.5 dark:bg-neutral-900/40">
        <Avatar className="size-11 border border-border">
          {doctor?.profilePhoto && (
            <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
          )}
          <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
            {getDoctorInitials(doctor?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {doctor?.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor?.name || "Consultant"}`}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {doctor?.email || "Medical Consultation"}
          </p>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-5 px-6 py-4"
      >
        {/* Rating Field */}
        <form.Field
          name="rating"
          validators={{
            onChange: ({ value }) => {
              const parsed = editReviewZodSchema.shape.rating.safeParse(value)
              return parsed.success ? undefined : parsed.error.issues[0]?.message
            },
          }}
        >
          {(field) => {
            const currentRating = field.state.value
            const activeRating = hoveredRating ?? currentRating

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Rating <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs font-medium text-[#0B7285]">
                    {RATING_DESCRIPTIONS[activeRating] ?? "Select a rating"}
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Edit doctor rating 1 to 5 stars"
                  className="flex items-center gap-2"
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeRating
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={currentRating === star}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onClick={() => field.handleChange(star)}
                        className="group relative p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7285] focus-visible:ring-offset-2 rounded-md"
                      >
                        <Star
                          className={`size-7 transition-colors ${
                            isFilled
                              ? "fill-[#E3A130] text-[#E3A130]"
                              : "fill-neutral-100 text-neutral-300 dark:fill-neutral-800 dark:text-neutral-700"
                          }`}
                        />
                      </button>
                    )
                  })}
                  <span className="ml-2 text-sm font-semibold text-foreground">
                    {activeRating} / 5
                  </span>
                </div>

                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )
          }}
        </form.Field>

        {/* Comment Field */}
        <form.Field
          name="comment"
          validators={{
            onChange: ({ value }) => {
              const parsed = editReviewZodSchema.shape.comment.safeParse(value)
              return parsed.success ? undefined : parsed.error.issues[0]?.message
            },
          }}
        >
          {(field) => {
            const charCount = field.state.value?.length || 0

            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-review-comment" className="text-sm font-medium text-foreground">
                    Your Feedback & Review <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {charCount} / 1000
                  </span>
                </div>
                <Textarea
                  id="edit-review-comment"
                  placeholder="Update your review comments..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-xs text-destructive">
                    {String(field.state.meta.errors[0])}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Minimum 3 characters required.
                  </p>
                )}
              </div>
            )
          }}
        </form.Field>

        <DialogFooter className="border-t pt-4 gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#0B7285] hover:bg-[#095E70] text-white"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export const EditReviewDialog = ({
  open,
  onOpenChange,
  review,
  onSuccess,
}: EditReviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="border-b bg-muted/20 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#0B7285]">
            Edit Your Review
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the star rating and feedback for this consultation.
          </DialogDescription>
        </DialogHeader>

        {review && (
          <EditReviewFormInner
            key={review.id}
            review={review}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditReviewDialog
