"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-[#0B7285]/30 bg-[#0B7285]/10 text-[#0B7285] dark:bg-[#0B7285]/20";
    case "INPROGRESS":
      return "border-[#E3A130]/30 bg-[#E3A130]/10 text-[#7A4A09] dark:text-[#E3A130] dark:bg-[#E3A130]/20";
    case "COMPLETED":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20";
    case "CANCELED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
};

const getPaymentBadgeClass = (status?: string) => {
  switch (status) {
    case "PAID":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20";
    case "UNPAID":
      return "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
    case "FAILED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
};

interface DoctorViewAppointmentDetailsDialogProps {
  appointment: IAppointment | null;
  onClose: () => void;
}

export default function DoctorViewAppointmentDetailsDialog({
  appointment,
  onClose,
}: DoctorViewAppointmentDetailsDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={Boolean(appointment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            Reference ID: {appointment?.id}
          </DialogDescription>
        </DialogHeader>
        {appointment && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
              <p className="font-semibold text-foreground mb-1">
                Patient Information
              </p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Name: </span>
                  {appointment.patient?.name ?? "N/A"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Email: </span>
                  {appointment.patient?.email ?? "N/A"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Contact: </span>
                  {appointment.patient?.contactNumber ?? "N/A"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
              <p className="font-semibold text-foreground mb-1">
                Schedule & Status
              </p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Status: </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ml-1 ${getStatusBadgeClass(appointment.status)}`}
                  >
                    {appointment.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-foreground">Payment: </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ml-1 ${getPaymentBadgeClass(appointment.paymentStatus)}`}
                  >
                    {appointment.paymentStatus}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-foreground">Scheduled Time: </span>
                  {appointment.schedule?.startDateTime
                    ? format(new Date(appointment.schedule.startDateTime), "PPpp")
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {appointment?.status === "COMPLETED" && (
            <Button
              type="button"
              className="bg-[#0B7285] text-white hover:bg-[#095E70]"
              onClick={() => {
                const aptId = appointment.id;
                onClose();
                router.push(`/doctor/dashboard/prescriptions?appointmentId=${aptId}`);
              }}
            >
              Create Prescription
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
