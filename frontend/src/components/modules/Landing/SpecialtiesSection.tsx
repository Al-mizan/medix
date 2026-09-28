"use client";

import { useMemo } from "react";
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
  ShieldCheck,
} from "lucide-react";
import { getAllSpecialties } from "@/services/doctor.services";
import { type ISpecialty } from "@/types/specialty.types";
import { Skeleton } from "@/components/ui/skeleton";

// Map specialty title keywords to distinct clinical icons
const getSpecialtyIcon = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("cardio") || normalized.includes("heart")) {
    return <HeartPulse className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("neuro") || normalized.includes("brain")) {
    return <Brain className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("pediatric") || normalized.includes("child")) {
    return <Baby className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("ortho") || normalized.includes("bone")) {
    return <Bone className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("eye") || normalized.includes("ophthalm")) {
    return <Eye className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("dent") || normalized.includes("oral")) {
    return <Smile className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("derma") || normalized.includes("skin")) {
    return <Sparkles className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("surge") || normalized.includes("general")) {
    return <Activity className="size-6 text-primary group-hover:text-white transition-colors" />;
  }
  return <Stethoscope className="size-6 text-primary group-hover:text-white transition-colors" />;
};

export default function SpecialtiesSection() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["specialties"],
    queryFn: getAllSpecialties,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const specialties: ISpecialty[] = useMemo(() => {
    return Array.isArray(response) ? response : (response?.data ?? []);
  }, [response]);

  return (
    <section id="specialties" className="py-14 sm:py-20 bg-background border-b border-border/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Punchy headline, zero paragraphs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3 py-1 text-xs font-semibold text-tint-primary-text">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Medical Disciplines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Care for any symptom.
            </h2>
            <p className="text-sm text-text-secondary">
              Select your department to connect with board-certified physicians today.
            </p>
          </div>

          <Link
            href="/consultation"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group self-start sm:self-auto"
          >
            <span>All 20+ Disciplines</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3"
              >
                <Skeleton className="size-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && specialties.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
            <Stethoscope className="size-8 text-primary mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">Specialties Directory Updating</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
              Browse available doctors across all departments in the consultation finder.
            </p>
            <div className="mt-4">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <span>Find Doctors</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Visual-First Specialties Grid */}
        {!isLoading && specialties.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
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
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-surface p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="space-y-3">
                    {/* Visual Clinical Icon */}
                    <div className="flex size-12 items-center justify-center rounded-xl bg-tint-primary-bg border border-primary/15 transition-all duration-200 group-hover:bg-primary shrink-0">
                      {getSpecialtyIcon(specialty.title)}
                    </div>

                    {/* Specialty Title */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {specialty.title}
                      </h3>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">
                        Specialist care
                      </p>
                    </div>
                  </div>

                  {/* Micro Visual Status Pill */}
                  <div className="mt-4 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-secondary" />
                      <span>Available</span>
                    </span>
                    <ChevronRight className="size-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
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
