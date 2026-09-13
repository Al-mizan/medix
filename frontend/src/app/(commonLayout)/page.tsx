import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
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
  title: "Modern Healthcare, Seamlessly Connected",
  description:
    "Connect with board-certified physicians, schedule video consultations in seconds, and experience proactive care guided by intelligent clinical assistance.",
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
      queryFn: () => getDoctors("sort=-averageRating&limit=6"),
    }),
  ]).catch((error) => {
    // Non-blocking catch to ensure landing page renders even if backend is temporarily unreachable
    console.error("Error prefetching landing page data:", error);
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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

