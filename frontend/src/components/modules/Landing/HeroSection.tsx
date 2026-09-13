import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroPreviewCard from "./HeroPreviewCard";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background border-b border-border/60">
      {/* Subtle architectural background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Hero Body */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3.5 py-1 text-xs font-semibold text-tint-primary-text shadow-2xs">
              <span className="flex size-2 rounded-full bg-secondary animate-pulse" />
              <span>Verified Clinical Network</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1 text-ai font-medium">
                <Sparkles className="size-3" />
                AI-Powered Triage
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Modern Healthcare,{" "}
                <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                  Seamlessly Connected
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
                Connect with board-certified physicians, schedule video or
                in-clinic consultations in seconds, and experience proactive care
                guided by intelligent clinical assistance.
              </p>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold text-base px-7 py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/consultation" className="flex items-center justify-center gap-2">
                  <Calendar className="size-5" />
                  <span>Book an Appointment</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-surface text-foreground hover:bg-muted font-medium text-base px-7 py-6 rounded-xl shadow-2xs"
              >
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="size-4 text-text-muted" />
                </Link>
              </Button>
            </div>

            {/* Clinical Trust Metrics Row */}
            <div className="pt-4 sm:pt-6 border-t border-border/80 w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-foreground">
                  <Star className="size-5 text-warning fill-warning" />
                  <span>99.8%</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Patient Satisfaction
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-foreground">
                  <Users className="size-5 text-primary" />
                  <span>15k+</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Consultations Done
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-foreground">
                  <ShieldCheck className="size-5 text-secondary" />
                  <span>100%</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Verified Doctors
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Thoughtful Clinical Preview Visual */}
          <div className="lg:col-span-5 relative">
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
