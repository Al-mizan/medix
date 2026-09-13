import Link from "next/link";
import { Star, ShieldCheck, Calendar, Briefcase, DollarSign } from "lucide-react";
import { type IDoctor } from "@/types/doctor.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const getDoctorInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "DR";
};

interface TopDoctorCardProps {
  doctor: IDoctor;
}

export default function TopDoctorCard({ doctor }: TopDoctorCardProps) {
  const specialtiesList =
    doctor.specialties?.map((item) => item.specialty.title) ?? [];
  const rating = doctor.averageRating
    ? Number(doctor.averageRating).toFixed(1)
    : "5.0";

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      {/* Top Doctor Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-16 ring-2 ring-tint-primary-bg">
              <AvatarImage
                src={doctor.profilePhoto}
                alt={doctor.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-tint-primary-bg text-primary font-bold text-base">
                {getDoctorInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {doctor.name}
                </h3>
                <ShieldCheck className="size-4 text-secondary shrink-0" />
              </div>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {doctor.designation || "Consultant Physician"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {doctor.currentWorkingPlace || "Medix Health Network"}
              </p>
            </div>
          </div>

          {/* Rating pill */}
          <div className="flex items-center gap-1 rounded-md bg-tint-warning-bg px-2 py-1 text-xs font-bold text-tint-warning-text shrink-0">
            <Star className="size-3.5 text-warning fill-warning" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Specialty Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 min-h-[1.75rem]">
          {specialtiesList.length > 0 ? (
            specialtiesList.slice(0, 3).map((title) => (
              <Badge
                key={`${doctor.id}-${title}`}
                variant="secondary"
                className="bg-tint-primary-bg text-tint-primary-text hover:bg-tint-primary-bg/80 border-none text-[11px] font-medium px-2 py-0.5"
              >
                {title}
              </Badge>
            ))
          ) : (
            <Badge
              variant="secondary"
              className="bg-muted text-text-secondary border-none text-[11px]"
            >
              General Practice
            </Badge>
          )}
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-surface p-3 border border-border/80 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Briefcase className="size-3.5 text-primary" />
            <span>
              <strong className="text-foreground">
                {doctor.experience ?? 0}+ yrs
              </strong>{" "}
              exp
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <DollarSign className="size-3.5 text-secondary" />
            <span>
              Fee:{" "}
              <strong className="text-foreground">
                ${doctor.appointmentFee ? Number(doctor.appointmentFee).toFixed(0) : "50"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Actions CTA */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-2.5">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full border-border text-xs font-semibold text-foreground hover:bg-muted"
        >
          <Link href={`/consultation/doctor/${doctor.id}`}>
            Profile
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="w-full bg-accent text-accent-foreground hover:bg-accent-hover text-xs font-semibold shadow-xs"
        >
          <Link
            href={`/consultation/doctor/${doctor.id}`}
            className="flex items-center justify-center gap-1.5"
          >
            <Calendar className="size-3.5" />
            <span>Book Now</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
