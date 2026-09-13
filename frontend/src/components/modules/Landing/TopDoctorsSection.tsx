"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Stethoscope } from "lucide-react";
import { getDoctors } from "@/services/doctor.services";
import { type IDoctor } from "@/types/doctor.types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TopDoctorCard from "./TopDoctorCard";

export default function TopDoctorsSection() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["top-doctors"],
    queryFn: () => getDoctors("sort=-averageRating&limit=6"),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });

  // Support both raw array or ApiResponse wrapping
  const doctors: IDoctor[] = Array.isArray(response)
    ? response
    : (response?.data ?? []);

  return (
    <section id="top-doctors" className="py-16 sm:py-24 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md bg-tint-secondary-bg px-2.5 py-1 text-xs font-semibold text-tint-secondary-text">
              Top Clinical Performers
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Highest-Rated Medical Specialists
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Book consultations with doctors recognized for clinical precision,
              patient empathy, and outstanding health outcomes.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-border text-foreground hover:bg-muted self-start md:self-auto"
          >
            <Link href="/consultation" className="flex items-center gap-2">
              <span>View All Doctors</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-background p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && doctors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-text-muted mb-4">
              <Stethoscope className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Doctors Listed Yet</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              Our clinical directory is currently synchronizing. View the full consultation directory or check back soon.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link href="/consultation">Explore Consultations</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <TopDoctorCard key={String(doctor.id)} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
