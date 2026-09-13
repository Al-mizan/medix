"use client"

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
import { createReview } from "@/services/review.services"
import { type IAppointment } from "@/types/appointment.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar, Loader2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: IAppointment | null
  onSuccess?: () => void
}

const reviewZodSchema = z.object({
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

export const ReviewDialog = ({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: ReviewDialogProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: createReview,
  })

  const form = useForm({
    defaultValues: {
      rating: 5,
      comment: "",
    },
    onSubmit: async ({ value }) => {
      if (!appointment?.id) {
        toast.error("Invalid appointment for review")
        return
      }

      const parsed = reviewZodSchema.safeParse(value)
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Please fix validation errors."
        toast.error(errorMsg)
        return
      }

      try {
        const response = await mutation.mutateAsync({
          appointmentId: appointment.id,
          rating: value.rating,
          comment: value.comment.trim(),
        })

        if (!response?.success && !response?.data) {
          toast.error(response?.message || "Failed to submit review")
          return
        }

        toast.success("Thank you! Your review has been submitted.")
        await queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
        await queryClient.invalidateQueries({ queryKey: ["my-reviews"] })
        await queryClient.invalidateQueries({ queryKey: ["appointments"] })
        router.refresh()
        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to submit review"
        toast.error(message)
      }
    },
  })

  if (!appointment) return null

  const doctor = appointment.doctor
  const appointmentDate = appointment.schedule?.startDateTime || appointment.createdAt
  const formattedDate = appointmentDate
    ? format(new Date(appointmentDate), "MMM dd, yyyy")
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="border-b bg-muted/20 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#0B7285]">
            Rate Your Consultation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Your honest feedback helps other patients and helps doctors improve care quality.
          </DialogDescription>
        </DialogHeader>

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
              {doctor?.designation || "Medical Specialist"}
            </p>
          </div>
          {formattedDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
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
                const parsed = reviewZodSchema.shape.rating.safeParse(value)
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
                      Overall Rating <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs font-medium text-[#0B7285]">
                      {RATING_DESCRIPTIONS[activeRating] ?? "Select a rating"}
                    </span>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Doctor rating 1 to 5 stars"
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

          {/* Comment Textarea */}
          <form.Field
            name="comment"
            validators={{
              onChange: ({ value }) => {
                const parsed = reviewZodSchema.shape.comment.safeParse(value)
                return parsed.success ? undefined : parsed.error.issues[0]?.message
              },
            }}
          >
            {(field) => {
              const charCount = field.state.value?.length || 0

              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                      Your Comments & Experience <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {charCount} / 1000
                    </span>
                  </div>
                  <Textarea
                    id="review-comment"
                    placeholder="Describe how your consultation went, doctor's attentiveness, clarity of guidance, or treatment outcomes..."
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
                      Minimum 3 characters required. Please keep feedback respectful and constructive.
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
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#D9542E] hover:bg-[#B8431F] text-white"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewDialog
