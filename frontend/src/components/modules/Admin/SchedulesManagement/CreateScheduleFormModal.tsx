"use client"

import { createScheduleAction } from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    baseScheduleSchema,
    createScheduleFormZodSchema,
    type ICreateScheduleFormValues,
} from "@/zod/schedule.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

const defaultValues: ICreateScheduleFormValues = {
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
}

const CreateScheduleFormModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createScheduleAction,
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const parsed = createScheduleFormZodSchema.safeParse(value)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || "Invalid schedule parameters")
        return
      }

      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to create schedules")
        return
      }

      const createdCount = result.data?.length ?? 0
      toast.success(
        result.message ||
          (createdCount > 0
            ? `${createdCount} schedules created successfully`
            : "Schedules created successfully"),
      )
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["schedules"] })
      void queryClient.refetchQueries({ queryKey: ["schedules"], type: "active" })
      router.refresh()
    },
  })

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)

      if (!nextOpen) {
        form.reset()
      }
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full sm:w-auto shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Create Schedule</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 flex flex-col"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-4 shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight">Create Schedule</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate 30-minute consultation slots across a selected date and time range.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-4">
          <form
            id="create-schedule-form"
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

            <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Slot Rule:</span> System automatically carves non-overlapping 30-minute intervals between Start Time and End Time for each day in the date range. Existing slots are preserved.
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
            form="create-schedule-form"
            isPending={isPending}
            pendingLabel="Generating Slots..."
            className="w-full sm:w-auto"
          >
            Create Schedule
          </AppSubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateScheduleFormModal
