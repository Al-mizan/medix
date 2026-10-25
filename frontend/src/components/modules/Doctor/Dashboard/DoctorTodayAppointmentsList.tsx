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
      return "border-primary/30 bg-primary/10 text-primary";
    case "INPROGRESS":
      return "border-warning/30 bg-warning/10 text-warning";
    case "COMPLETED":
      return "border-success/30 bg-success/10 text-success";
    case "CANCELED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
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
    <Card className="border-border bg-card text-card-foreground shadow-xs lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4 text-primary" />
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
          className="text-xs text-primary hover:bg-primary/10"
        >
          <Link href="/doctor/dashboard/appointments">
            View all
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              className="mt-4 border-primary/30 text-primary text-xs hover:bg-primary/10"
            >
              <Link href="/doctor/dashboard/appointments">View Schedule</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="size-10 border border-border shrink-0">
                      {patient?.profilePhoto && (
                        <AvatarImage
                          src={patient.profilePhoto}
                          alt={patient?.name ?? "Patient"}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(patient?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate" title={patient?.name ?? "Patient"}>
                        {patient?.name ?? "Patient"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="size-3 text-primary" />
                          {startTime} - {endTime}
                        </span>
                        {patient?.contactNumber && (
                          <>
                            <span>•</span>
                            <span className="truncate">{patient.contactNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                            ? "h-8 bg-warning text-warning-foreground hover:bg-warning/90 px-3 text-xs"
                            : "h-8 border-primary/40 px-3 text-xs text-primary hover:bg-primary/10"
                        }
                      >
                        <Link
                          href={
                            appointment.videoCallingId
                              ? `/consultation/session/${appointment.videoCallingId}`
                              : `/consultation/doctor/${appointment.doctorId || appointment.id}`
                          }
                        >
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
