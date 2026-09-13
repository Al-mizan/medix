"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookAppointmentModal from "@/components/modules/Patient/Appointments/BookAppointmentModal";
import { type IDoctor } from "@/types/doctor.types";

const getDoctorInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "DR";
};

interface DoctorConsultationCardProps {
  doctor: IDoctor;
  isAuthenticated?: boolean;
  viewerRole?: string | null;
}

export default function DoctorConsultationCard({
  doctor,
  isAuthenticated,
  viewerRole,
}: DoctorConsultationCardProps) {
  const specialtiesList =
    doctor.specialties?.map((item) => item.specialty.title) ?? [];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-linear-to-r from-cyan-500 via-sky-500 to-blue-500 opacity-80" />
      <div className="flex items-start gap-3">
        <Avatar className="size-14 ring-2 ring-blue-100">
          <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
          <AvatarFallback>{getDoctorInitials(doctor.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-semibold">{doctor.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {doctor.designation || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            {doctor.currentWorkingPlace || "N/A"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {doctor.email || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-lg bg-muted/40 p-3 text-sm">
        <p>
          <span className="font-medium">Experience:</span>{" "}
          {doctor.experience ?? 0} years
        </p>
        <p>
          <span className="font-medium">Fee:</span> $
          {doctor.appointmentFee?.toFixed(2) ?? "N/A"}
        </p>
        <p>
          <span className="font-medium">Rating:</span>{" "}
          {doctor.averageRating?.toFixed(1) ?? "0.0"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {specialtiesList.length > 0 ? (
          specialtiesList.slice(0, 3).map((title) => (
            <Badge key={`${doctor.id}-${title}`} variant="secondary">
              {title}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary">No specialties</Badge>
        )}
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <BookAppointmentModal
          doctorId={String(doctor.id)}
          doctorName={doctor.name}
          isAuthenticated={Boolean(isAuthenticated)}
          viewerRole={viewerRole}
          triggerClassName="w-full"
          fullWidth
        />
        <Button asChild className="w-full">
          <Link href={`/consultation/doctor/${doctor.id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </article>
  );
}
