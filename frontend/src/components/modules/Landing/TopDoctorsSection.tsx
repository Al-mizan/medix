"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Stethoscope, ShieldCheck } from "lucide-react";
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

  const doctors: IDoctor[] = Array.isArray(response)
    ? response
    : (response?.data ?? []);

  return (
    <section id="top-doctors" className="py-16 sm:py-24 bg-surface border-b border-border/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-tint-secondary-bg px-3 py-1 text-xs font-semibold text-tint-secondary-text">
              <ShieldCheck className="size-3.5 text-secondary" />
              <span>BMDC-Verified Medical Faculty</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Consult with top medical specialists.
            </h2>
            <p className="text-sm text-text-secondary">
              Board-certified doctors with proven clinical outcomes and same-day availability.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-border text-foreground hover:bg-muted self-start md:self-auto shadow-2xs font-semibold focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Link href="/consultation" className="flex items-center gap-2">
              <span>View All 50+ Doctors</span>
              <ArrowRight className="size-4 text-primary" />
            </Link>
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-background p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Skeleton className="h-9.5 rounded-lg" />
                  <Skeleton className="h-9.5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && doctors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-text-muted mb-4">
              <Stethoscope className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Clinical Directory Synchronizing</h3>
            <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto">
              Our clinical faculty database is currently updating available schedules. You can explore all consultations now.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold">
                <Link href="/consultation">Explore All Consultations</Link>
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
