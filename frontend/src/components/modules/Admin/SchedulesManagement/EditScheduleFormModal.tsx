"use client"

import { updateScheduleAction } from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ISchedule } from "@/types/schedule.types"
import {
    baseScheduleSchema,
    editScheduleFormZodSchema,
    type IEditScheduleFormValues,
} from "@/zod/schedule.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

interface EditScheduleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: ISchedule | null
}

const getFormattedInputValue = (value: string | Date | undefined, formatString: string) => {
  if (!value) {
    return ""
  }

  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) {
    return ""
  }

  return format(dateValue, formatString)
}

const getInitialValues = (schedule: ISchedule | null): IEditScheduleFormValues => ({
  startDate: getFormattedInputValue(schedule?.startDateTime, "yyyy-MM-dd"),
  endDate: getFormattedInputValue(schedule?.endDateTime, "yyyy-MM-dd"),
  startTime: getFormattedInputValue(schedule?.startDateTime, "HH:mm"),
  endTime: getFormattedInputValue(schedule?.endDateTime, "HH:mm"),
})

const EditScheduleFormModal = ({
  open,
  onOpenChange,
  schedule,
}: EditScheduleFormModalProps) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: IEditScheduleFormValues }) =>
      updateScheduleAction(scheduleId, payload),
  })

  const form = useForm({
    defaultValues: getInitialValues(schedule),
    onSubmit: async ({ value }) => {
      if (!schedule) {
        toast.error("Schedule not found")
        return
      }

      const parsed = editScheduleFormZodSchema.safeParse(value)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || "Invalid schedule parameters")
        return
      }

      const result = await mutateAsync({
        scheduleId: schedule.id,
        payload: value,
      })

      if (!result.success) {
        toast.error(result.message || "Failed to update schedule")
        return
      }

      toast.success(result.message || "Schedule updated successfully")
      onOpenChange(false)

      void queryClient.invalidateQueries({ queryKey: ["schedules"] })
      void queryClient.refetchQueries({ queryKey: ["schedules"], type: "active" })
      router.refresh()
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(getInitialValues(schedule))
    }
  }, [form, open, schedule])

  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 flex flex-col"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-4 shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight">Edit Schedule</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the date and time range for this consultation schedule slot.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-4">
          <form
            id="edit-schedule-form"
            method="POST"
            action="#"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="startDate"
                validators={{
                  onChange: ({ value }) => {
                    const res = baseScheduleSchema.shape.startDate.safeParse(value)
                    return res.success ? undefined : res.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <AppField field={field} label="Start Date" type="date" />
                )}
              </form.Field>

              <form.Field
                name="endDate"
                validators={{
                  onChange: ({ value }) => {
                    const res = baseScheduleSchema.shape.endDate.safeParse(value)
                    return res.success ? undefined : res.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <AppField field={field} label="End Date" type="date" />
                )}
              </form.Field>

              <form.Field
                name="startTime"
                validators={{
                  onChange: ({ value }) => {
                    const res = baseScheduleSchema.shape.startTime.safeParse(value)
                    return res.success ? undefined : res.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <AppField field={field} label="Start Time" type="time" />
                )}
              </form.Field>

              <form.Field
                name="endTime"
                validators={{
                  onChange: ({ value }) => {
                    const res = baseScheduleSchema.shape.endTime.safeParse(value)
                    return res.success ? undefined : res.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <AppField field={field} label="End Time" type="time" />
                )}
              </form.Field>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t bg-muted/20 px-6 py-3.5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <AppSubmitButton
            form="edit-schedule-form"
            isPending={isPending}
            pendingLabel="Updating..."
            className="w-full sm:w-auto"
          >
            Save Changes
          </AppSubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditScheduleFormModal
