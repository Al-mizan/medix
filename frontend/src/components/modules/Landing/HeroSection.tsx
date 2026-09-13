import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-border/70 bg-surface/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Medix<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a
              href="#specialties"
              className="transition-colors hover:text-primary"
            >
              Specialties
            </a>
            <a
              href="#top-doctors"
              className="transition-colors hover:text-primary"
            >
              Top Doctors
            </a>
            <a
              href="#why-choose"
              className="transition-colors hover:text-primary"
            >
              Why Medix
            </a>
            <Link
              href="/consultation"
              className="transition-colors hover:text-primary"
            >
              Consultations
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="text-sm font-medium text-foreground hover:bg-muted"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent-hover font-medium shadow-sm transition-all"
            >
              <Link href="/consultation" className="flex items-center gap-1.5">
                <span>Book Appointment</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
                className="border-border bg-surface text-foreground hover:bg-muted/80 font-medium text-base px-7 py-6 rounded-xl shadow-2xs"
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
            <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-xl">
              {/* Top Accent bar */}
              <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-primary via-secondary to-accent" />

              {/* Header inside card */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-tint-primary-bg flex items-center justify-center text-primary font-bold text-base">
                    DR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-foreground">
                        Dr. Sarah Jenkins
                      </h2>
                      <ShieldCheck className="size-4 text-secondary fill-secondary/20" />
                    </div>
                    <p className="text-xs text-text-secondary">
                      Chief of Cardiology &bull; 14 yrs exp
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-tint-secondary-bg text-tint-secondary-text border-none font-medium px-2 py-0.5"
                >
                  Active Now
                </Badge>
              </div>

              {/* Consultation details badge */}
              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-muted/60 p-3.5 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="size-3.5 text-primary" />
                      Next Available Slot
                    </span>
                    <span className="font-semibold text-secondary">
                      Today, 04:30 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-border/50">
                    <span>Consultation Fee</span>
                    <span className="font-bold text-foreground">$75.00</span>
                  </div>
                </div>

                {/* AI Assistant Insight Pill */}
                <div className="rounded-xl bg-tint-ai-bg/70 p-3 border border-ai/20 flex items-start gap-2.5">
                  <div className="size-6 rounded-lg bg-ai text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-tint-ai-text">
                      Medix Clinical Assistant
                    </span>
                    <p className="text-text-secondary mt-0.5">
                      Symptoms match Cardiology triage. Medical records pre-loaded for consultation.
                    </p>
                  </div>
                </div>

                {/* Quick features checklist */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-secondary shrink-0" />
                    <span>Instant PDF Rx</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-secondary shrink-0" />
                    <span>Encrypted Video</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-secondary shrink-0" />
                    <span>Follow-up Chat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-secondary shrink-0" />
                    <span>Stripe Protected</span>
                  </div>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent-hover font-semibold shadow-xs"
                >
                  <Link href="/consultation">Book With Dr. Jenkins</Link>
                </Button>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-lg">
                <div className="flex size-9 items-center justify-center rounded-full bg-tint-accent-bg text-accent">
                  <HeartHandshake className="size-5" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">
                    100% Patient Privacy
                  </p>
                  <p className="text-text-secondary">HIPAA & ISO certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
