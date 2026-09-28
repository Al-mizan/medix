import Link from "next/link";
import { Star, ShieldCheck, ArrowRight, Briefcase } from "lucide-react";
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
  const primarySpecialty =
    doctor.specialties?.[0]?.specialty?.title ?? "General Medicine";
  const rating = doctor.averageRating
    ? Number(doctor.averageRating).toFixed(1)
    : "4.9";
  const fee = doctor.appointmentFee ? Number(doctor.appointmentFee).toFixed(0) : "50";
  const experienceYears = doctor.experience ?? 5;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
      {/* Physician Visual Card Body */}
      <div className="space-y-4">
        {/* Top Header: Avatar + Identity */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-16 ring-2 ring-primary/20 rounded-2xl">
              <AvatarImage
                src={doctor.profilePhoto}
                alt={`Photo of ${doctor.name}`}
                className="object-cover rounded-2xl"
              />
              <AvatarFallback className="bg-tint-primary-bg text-primary font-bold text-base rounded-2xl">
                {getDoctorInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-secondary ring-2 ring-surface"
              title="Online and available"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/consultation/doctor/${doctor.id}`}
                className="text-base font-bold text-foreground truncate hover:text-primary transition-colors"
              >
                {doctor.name}
              </Link>
              <span title="BMDC Verified License">
                <ShieldCheck className="size-4 text-secondary shrink-0" />
              </span>
            </div>

            <p className="text-xs font-medium text-text-secondary mt-0.5 truncate">
              {doctor.designation || "Senior Consultant Physician"}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-tint-primary-bg text-tint-primary-text border-none text-[11px] font-semibold px-2.5 py-0.5"
              >
                {primarySpecialty}
              </Badge>
            </div>
          </div>
        </div>

        {/* Clean Scannable Metrics Strip */}
        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5 border border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-warning fill-warning shrink-0" />
            <span className="font-bold text-foreground tabular-nums">{rating}</span>
            <span className="text-[11px] text-text-muted">(120+)</span>
          </div>

          <span className="text-border">&bull;</span>

          <div className="flex items-center gap-1.5 text-text-secondary">
            <Briefcase className="size-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground tabular-nums">{experienceYears}+ yrs</span>
          </div>

          <span className="text-border">&bull;</span>

          <div className="text-right">
            <span className="font-extrabold text-foreground tabular-nums text-sm">${fee}</span>
            <span className="text-[10px] text-text-muted ml-0.5">/ visit</span>
          </div>
        </div>

        {/* Live Availability Cue */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5">
          <span className="flex items-center gap-1.5 font-medium text-secondary">
            <span className="size-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Available Today</span>
          </span>
          <span className="text-[11px] text-text-muted">Instant HD Video</span>
        </div>
      </div>

      {/* Single Decisive Primary CTA */}
      <div className="mt-5 pt-3.5 border-t border-border/70">
        <Button
          asChild
          size="default"
          className="w-full bg-accent text-accent-foreground hover:bg-accent-hover font-semibold shadow-2xs h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-accent transition-all"
        >
          <Link
            href={`/consultation/doctor/${doctor.id}`}
            className="flex items-center justify-center gap-2"
          >
            <span>Book Consultation</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

