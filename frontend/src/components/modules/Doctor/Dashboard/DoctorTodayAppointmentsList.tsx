import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CalendarCheck, Clock, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IAppointment } from "@/types/appointment.types";

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-[#0B7285]/30 bg-[#0B7285]/10 text-[#0B7285] dark:bg-[#0B7285]/20";
    case "INPROGRESS":
      return "border-[#E3A130]/30 bg-[#E3A130]/10 text-[#B87A14] dark:text-[#E3A130] dark:bg-[#E3A130]/20";
    case "COMPLETED":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20";
    case "CANCELED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
};

const getInitials = (name?: string) => {
  if (!name) return "PT";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface DoctorTodayAppointmentsListProps {
  todayAppointments: IAppointment[];
}

export default function DoctorTodayAppointmentsList({
  todayAppointments,
}: DoctorTodayAppointmentsListProps) {
  return (
    <Card className="border-neutral-200 shadow-sm lg:col-span-4 dark:border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4 text-[#0B7285]" />
            Today&apos;s Appointments
          </CardTitle>
          <CardDescription>
            {todayAppointments.length} appointment
            {todayAppointments.length === 1 ? "" : "s"} scheduled for today
          </CardDescription>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
        >
          <Link href="/doctor/dashboard/appointments">
            View all
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0B7285]/10 text-[#0B7285]">
              <CalendarCheck className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No appointments today
            </h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              You have no consultations scheduled for today. Review your upcoming schedule or view all appointments.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4 border-[#0B7285]/30 text-xs hover:bg-[#0B7285]/10"
            >
              <Link href="/doctor/dashboard/appointments">View Schedule</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {todayAppointments.map((appointment) => {
              const patient = appointment.patient;
              const schedule = appointment.schedule;
              const startTime = schedule?.startDateTime
                ? format(new Date(schedule.startDateTime), "hh:mm a")
                : "N/A";
              const endTime = schedule?.endDateTime
                ? format(new Date(schedule.endDateTime), "hh:mm a")
                : "N/A";
              const isScheduled = appointment.status === "SCHEDULED";
              const isInProgress = appointment.status === "INPROGRESS";

              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-neutral-200 dark:border-neutral-700">
                      {patient?.profilePhoto && (
                        <AvatarImage
                          src={patient.profilePhoto}
                          alt={patient?.name ?? "Patient"}
                        />
                      )}
                      <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
                        {getInitials(patient?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {patient?.name ?? "Patient"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-[#0B7285]" />
                          {startTime} - {endTime}
                        </span>
                        {patient?.contactNumber && (
                          <>
                            <span>•</span>
                            <span>{patient.contactNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                    >
                      {appointment.status ?? "SCHEDULED"}
                    </Badge>

                    {(isScheduled || isInProgress) && (
                      <Button
                        asChild
                        size="sm"
                        variant={isInProgress ? "default" : "outline"}
                        className={
                          isInProgress
                            ? "h-8 bg-[#E3A130] px-3 text-xs text-white hover:bg-[#B87A14]"
                            : "h-8 border-[#0B7285]/40 px-3 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
                        }
                      >
                        <Link href={`/consultation/doctor/${appointment.id}`}>
                          <Video className="mr-1.5 size-3.5" />
                          {isInProgress ? "Resume Call" : "Join Call"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
