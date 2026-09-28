import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroPreviewCard from "./HeroPreviewCard";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background border-b border-border/70">
      {/* Subtle architectural background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Hero Body */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Punchy Editorial Copy & Primary CTA */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6 sm:space-y-7">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-tint-secondary-bg px-3.5 py-1 text-xs font-semibold text-tint-secondary-text shadow-2xs">
              <span className="flex size-2 rounded-full bg-secondary animate-pulse" />
              <span>Specialists On Duty Now</span>
            </div>

            {/* Visual-First Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                Healthcare made{" "}
                <span className="text-primary">
                  simple.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
                Connect with board-certified physicians in under 8 minutes. Private HD video visits,
                instant valid prescriptions, and continuous follow-up care from anywhere.
              </p>
            </div>

            {/* Primary Action & Micro Note */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold text-base px-8 py-6 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Link href="/consultation" className="flex items-center justify-center gap-2.5">
                    <Calendar className="size-5" />
                    <span>Book Consultation</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border bg-surface text-foreground hover:bg-muted font-medium text-base px-6 py-6 rounded-xl shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Link href="/#specialties">
                    <span>Browse Specialties</span>
                  </Link>
                </Button>
              </div>

              {/* Minimal Trust Strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary pt-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="size-4 text-secondary shrink-0" />
                  BMDC Verified Doctors
                </span>
                <span className="text-border hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="size-4 text-primary shrink-0" />
                  &lt; 8 min wait
                </span>
                <span className="text-border hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <FileCheck2 className="size-4 text-accent shrink-0" />
                  Instant Digital Rx
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase */}
          <div className="lg:col-span-6 relative w-full">
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
