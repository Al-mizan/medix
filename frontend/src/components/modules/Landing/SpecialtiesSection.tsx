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
  Ear,
  Pill,
  Wind,
} from "lucide-react";
import { getAllSpecialties } from "@/services/doctor.services";
import { type ISpecialty } from "@/types/specialty.types";
import { Skeleton } from "@/components/ui/skeleton";

interface CuratedSpecialty {
  id: string;
  title: string;
  description: string;
  symptomHint: string;
  doctorCount: number;
}

const CORE_SPECIALTIES: CuratedSpecialty[] = [
  {
    id: "cardio-spec",
    title: "Cardiology",
    description: "Heart, vascular, and circulatory care",
    symptomHint: "Chest pain, palpitations, hypertension",
    doctorCount: 14,
  },
  {
    id: "neuro-spec",
    title: "Neurology",
    description: "Brain, spine, and central nervous system",
    symptomHint: "Migraines, neuropathy, vertigo",
    doctorCount: 9,
  },
  {
    id: "pediatric-spec",
    title: "Pediatrics",
    description: "Infant, child, and adolescent medicine",
    symptomHint: "Fever, vaccinations, growth checks",
    doctorCount: 18,
  },
  {
    id: "ortho-spec",
    title: "Orthopedics",
    description: "Bones, joints, ligaments, and trauma",
    symptomHint: "Joint pain, sports injury, back pain",
    doctorCount: 12,
  },
  {
    id: "derma-spec",
    title: "Dermatology",
    description: "Skin, hair, allergies, and cosmetic care",
    symptomHint: "Rashes, acne, eczema, lesions",
    doctorCount: 11,
  },
  {
    id: "general-spec",
    title: "General Medicine",
    description: "Primary triage, acute illness, and checkups",
    symptomHint: "Flu symptoms, fatigue, prescriptions",
    doctorCount: 26,
  },
  {
    id: "eye-spec",
    title: "Ophthalmology",
    description: "Vision correction, cataracts, and ocular care",
    symptomHint: "Blurry vision, eye strain, infections",
    doctorCount: 8,
  },
  {
    id: "psych-spec",
    title: "Psychiatry",
    description: "Mental wellness, therapy, and mood care",
    symptomHint: "Anxiety, insomnia, depression",
    doctorCount: 10,
  },
  {
    id: "gastro-spec",
    title: "Gastroenterology",
    description: "Digestive tract, liver, and abdominal health",
    symptomHint: "Acid reflux, IBS, stomach distress",
    doctorCount: 7,
  },
  {
    id: "pulmo-spec",
    title: "Pulmonology",
    description: "Lungs, breathing, and respiratory wellness",
    symptomHint: "Asthma, chronic cough, bronchitis",
    doctorCount: 6,
  },
  {
    id: "ent-spec",
    title: "ENT Specialists",
    description: "Ear, nose, throat, and sinus treatment",
    symptomHint: "Sinus pressure, earaches, tonsils",
    doctorCount: 9,
  },
  {
    id: "dental-spec",
    title: "Dental & Oral",
    description: "Teeth, gum health, and oral hygiene",
    symptomHint: "Tooth sensitivity, gingivitis, pain",
    doctorCount: 8,
  },
];

// Map specialty title keywords to distinct clinical icons
const getSpecialtyIcon = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("cardio") || normalized.includes("heart")) {
    return <HeartPulse className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("neuro") || normalized.includes("brain") || normalized.includes("spine")) {
    return <Brain className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("pediatric") || normalized.includes("child")) {
    return <Baby className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("ortho") || normalized.includes("bone") || normalized.includes("joint")) {
    return <Bone className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("eye") || normalized.includes("ophthalm") || normalized.includes("vision")) {
    return <Eye className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("dent") || normalized.includes("oral")) {
    return <Smile className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("derma") || normalized.includes("skin")) {
    return <Sparkles className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("pulmo") || normalized.includes("lung") || normalized.includes("breath")) {
    return <Wind className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("ent") || normalized.includes("ear") || normalized.includes("throat")) {
    return <Ear className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("gastro") || normalized.includes("stomach") || normalized.includes("digest")) {
    return <Pill className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  if (normalized.includes("surge") || normalized.includes("general") || normalized.includes("primary")) {
    return <Activity className="size-5.5 text-primary group-hover:text-white transition-colors" />;
  }
  return <Stethoscope className="size-5.5 text-primary group-hover:text-white transition-colors" />;
};

export default function SpecialtiesSection() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["specialties"],
    queryFn: getAllSpecialties,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const displaySpecialties = useMemo(() => {
    const rawList: ISpecialty[] = Array.isArray(response) ? response : (response?.data ?? []);
    
    // Map existing API specialties with default metadata if not populated
    const existingTitles = new Set(rawList.map((s) => s.title.toLowerCase().trim()));
    
    const combined: Array<{
      id: string;
      title: string;
      description: string;
      symptomHint: string;
      doctorCount: number;
    }> = [];

    // Prioritize API items
    rawList.forEach((item) => {
      const match = CORE_SPECIALTIES.find(
        (c) => c.title.toLowerCase() === item.title.toLowerCase().trim()
      );
      combined.push({
        id: item.id,
        title: item.title,
        description: item.description || match?.description || "Specialist clinical consultation",
        symptomHint: match?.symptomHint || "Acute & chronic condition management",
        doctorCount: match?.doctorCount || 10,
      });
    });

    // Supplement with curated core medical specialties to provide a complete, balanced directory
    CORE_SPECIALTIES.forEach((core) => {
      if (!existingTitles.has(core.title.toLowerCase())) {
        combined.push(core);
      }
    });

    return combined.slice(0, 12);
  }, [response]);

  return (
    <section id="specialties" className="py-16 sm:py-24 bg-background border-b border-border/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Punchy headline, clinical clarity */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3.5 py-1 text-xs font-semibold text-tint-primary-text shadow-2xs">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Medical Disciplines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Care for any symptom.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Select your clinical department to connect with BMDC board-certified specialists immediately.
            </p>
          </div>

          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group self-start sm:self-auto shrink-0 bg-surface sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg border sm:border-0 border-border/60"
          >
            <span>All 20+ Disciplines</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && displaySpecialties.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3 shadow-2xs"
              >
                <Skeleton className="size-11 rounded-xl" />
                <Skeleton className="h-4.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Visual Specialties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
          {displaySpecialties.map((specialty) => {
            const href = `/consultation?specialties.specialty.title=${encodeURIComponent(
              specialty.title
            )}`;

            return (
              <Link
                key={specialty.id}
                href={href}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
              >
                <div className="space-y-3">
                  {/* Visual Clinical Icon with subtle gradient glow */}
                  <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-tint-primary-bg border border-primary/15 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 shrink-0 shadow-2xs">
                    {getSpecialtyIcon(specialty.title)}
                  </div>

                  {/* Specialty Title & Symptoms */}
                  <div>
                    <h3
                      className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight"
                      title={specialty.title}
                    >
                      {specialty.title}
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 leading-snug">
                      {specialty.symptomHint}
                    </p>
                  </div>
                </div>

                {/* Micro Status Strip */}
                <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] font-semibold text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-secondary animate-pulse" />
                    <span>{specialty.doctorCount}+ On Duty</span>
                  </span>
                  <ChevronRight className="size-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
