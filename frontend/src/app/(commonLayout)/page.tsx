import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { JsonLd } from "@/components/shared/JsonLd";
import {
  HeroSection,
  SpecialtiesSection,
  TopDoctorsSection,
  WhyChooseSection,
  StatsSection,
  LandingFooter,
} from "@/components/modules/Landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Medix - Modern Clinical Healthcare, Seamlessly Connected",
  description:
    "Connect with board-certified physicians in under 8 minutes. Schedule encrypted video consultations, access accredited clinical triage, and receive verifiable digital prescriptions.",
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  name: "Medix Healthcare",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://medix.health",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://medix.health"}/icon.svg`,
  description:
    "Connect with board-certified physicians in under 8 minutes. Schedule encrypted video consultations, access accredited clinical triage, and receive verifiable digital prescriptions.",
  medicalSpecialty: [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "General Practice",
    "Psychiatry",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
};

export default async function HomePage() {
  const queryClient = new QueryClient();

  // Parallelize SSR queries to eliminate waterfalls per vercel-react-best-practices
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["specialties"],
      queryFn: getAllSpecialties,
    }),
    queryClient.prefetchQuery({
      queryKey: ["top-doctors"],
      queryFn: () => getDoctors("sortBy=averageRating&sortOrder=desc&limit=6"),
    }),
  ]).catch((error) => {
    // Non-blocking catch to ensure landing page renders even if backend is temporarily unreachable
    console.error("Error prefetching landing page data:", error);
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd schema={organizationSchema} />
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <HeroSection />
        <SpecialtiesSection />
        <TopDoctorsSection />
        <WhyChooseSection />
        <StatsSection />
        <LandingFooter />
      </main>
    </HydrationBoundary>
  );
}

