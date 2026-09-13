"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Stethoscope,
  HeartPulse,
  Brain,
  Eye,
  Smile,
  Activity,
  Bone,
  Baby,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { getAllSpecialties } from "@/services/doctor.services";
import { type ISpecialty } from "@/types/specialty.types";
import { Skeleton } from "@/components/ui/skeleton";

// Map specialty title keywords to appropriate clinical icons
const getSpecialtyIcon = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("cardio") || normalized.includes("heart")) {
    return <HeartPulse className="size-6 text-primary" />;
  }
  if (normalized.includes("neuro") || normalized.includes("brain")) {
    return <Brain className="size-6 text-primary" />;
  }
  if (normalized.includes("pediatric") || normalized.includes("child")) {
    return <Baby className="size-6 text-primary" />;
  }
  if (normalized.includes("ortho") || normalized.includes("bone")) {
    return <Bone className="size-6 text-primary" />;
  }
  if (normalized.includes("eye") || normalized.includes("ophthalm")) {
    return <Eye className="size-6 text-primary" />;
  }
  if (normalized.includes("dent") || normalized.includes("oral")) {
    return <Smile className="size-6 text-primary" />;
  }
  if (normalized.includes("derma") || normalized.includes("skin")) {
    return <Sparkles className="size-6 text-primary" />;
  }
  if (normalized.includes("surge") || normalized.includes("general")) {
    return <Activity className="size-6 text-primary" />;
  }
  return <Stethoscope className="size-6 text-primary" />;
};

// Curated specialty descriptions for fallback display
const getSpecialtyDescription = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("cardio")) return "Heart health, ECGs & blood pressure care";
  if (normalized.includes("neuro")) return "Brain, nerve, and spine disorders";
  if (normalized.includes("pediatric")) return "Comprehensive care for infants & kids";
  if (normalized.includes("ortho")) return "Joints, bones, sports injuries & rehab";
  if (normalized.includes("eye")) return "Vision checks, optics & eye surgeries";
  if (normalized.includes("dent")) return "Teeth alignment, oral hygiene & repairs";
  if (normalized.includes("derma")) return "Skin conditions, acne & dermatologic health";
  return "Comprehensive diagnosis, prevention & treatment";
};

export default function SpecialtiesSection() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["specialties"],
    queryFn: getAllSpecialties,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Support both raw array or ApiResponse wrapping
  const specialties: ISpecialty[] = Array.isArray(response)
    ? response
    : (response?.data ?? []);

  return (
    <section id="specialties" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md bg-tint-primary-bg px-2.5 py-1 text-xs font-semibold text-tint-primary-text">
              Comprehensive Care
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Explore Medical Specialties
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Find the right board-certified specialist for your specific health needs.
              Schedule immediate consultations with leaders across all major disciplines.
            </p>
          </div>

          <Link
            href="/consultation"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group self-start md:self-auto"
          >
            <span>Browse all medical disciplines</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface p-5 space-y-3"
              >
                <Skeleton className="size-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && specialties.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-text-muted mb-4">
              <Stethoscope className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Specialties Found</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              Our clinical specialties are currently updating. Please check back shortly or browse all available doctors.
            </p>
            <div className="mt-6">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                View Available Doctors
              </Link>
            </div>
          </div>
        )}

        {/* Specialties Grid */}
        {!isLoading && specialties.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
            {specialties.map((specialty) => {
              const href = `/consultation?specialty=${encodeURIComponent(
                specialty.id
              )}&specialties.specialty.title=${encodeURIComponent(
                specialty.title
              )}`;

              return (
                <Link
                  key={specialty.id}
                  href={href}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    {/* Specialty Icon */}
                    <div className="flex size-12 items-center justify-center rounded-xl bg-tint-primary-bg transition-colors duration-200 group-hover:bg-primary/15 mb-4">
                      {getSpecialtyIcon(specialty.title)}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {specialty.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {getSpecialtyDescription(specialty.title)}
                    </p>
                  </div>

                  {/* Footer Link indicator */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors">
                    <span>Consult Now</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
