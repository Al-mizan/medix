"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAppointment } from "@/types/appointment.types";

interface DoctorCompletedPromptDialogProps {
  appointment: IAppointment | null;
  onClose: () => void;
}

export default function DoctorCompletedPromptDialog({
  appointment,
  onClose,
}: DoctorCompletedPromptDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={Boolean(appointment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#178A5E]/10 text-[#178A5E]">
            <CheckCircle2 className="size-6" />
          </div>
          <DialogTitle>Consultation Completed</DialogTitle>
          <DialogDescription>
            The consultation with{" "}
            <strong className="text-foreground">
              {appointment?.patient?.name ?? "Patient"}
            </strong>{" "}
            has been marked as COMPLETED. Would you like to create a prescription for this patient now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Do It Later
          </Button>
          <Button
            type="button"
            className="bg-[#0B7285] text-white hover:bg-[#095E70]"
            onClick={() => {
              const aptId = appointment?.id;
              onClose();
              if (aptId) {
                router.push(`/doctor/dashboard/prescriptions?appointmentId=${aptId}`);
              }
            }}
          >
            <FilePlus className="mr-2 size-4" />
            Create Prescription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
