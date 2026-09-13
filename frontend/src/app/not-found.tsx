"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, Compass, Home, Search, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top subtle branding bar */}
      <header className="border-b border-border/60 bg-surface/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Activity className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Medix<span className="text-primary">.</span>
            </span>
          </Link>

          <span className="text-xs font-medium text-text-secondary bg-tint-primary-bg text-tint-primary-text px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Compass className="size-3.5" />
            Navigation Guard
          </span>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Animated decorative icon badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-tint-primary-bg/70 blur-xl pointer-events-none" />
            <div className="relative size-24 sm:size-28 rounded-3xl bg-surface border border-border/80 shadow-md flex items-center justify-center text-primary">
              <Compass className="size-12 sm:size-14 animate-pulse text-primary stroke-[1.75]" />
              <div className="absolute -top-2 -right-2 size-8 rounded-full bg-accent text-accent-foreground font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                404
              </div>
            </div>
          </div>

          {/* Text headings */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-danger-bg text-tint-danger-text border border-danger/20">
              Invalid Route • 404 Not Found
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Page or Resource Not Found
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
              We couldn&apos;t locate the consultation, clinical record, or page URL you requested. It might have been moved, renamed, or never existed.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto gap-2 border-border/80 hover:bg-muted/40 font-medium"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>

            <Button
              asChild
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs"
            >
              <Link href="/">
                <Home className="size-4" />
                Return Home
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="w-full sm:w-auto gap-2 font-medium"
            >
              <Link href="/dashboard">
                <Activity className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Helpful suggestions footer card */}
          <div className="pt-6 border-t border-border/60">
            <p className="text-xs font-medium text-text-muted mb-3">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/80 text-text-secondary hover:text-primary hover:border-primary/40 transition-colors shadow-2xs"
              >
                <Stethoscope className="size-3.5 text-primary" />
                Find Doctors
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border/80 text-text-secondary hover:text-primary hover:border-primary/40 transition-colors shadow-2xs"
              >
                <Search className="size-3.5 text-secondary" />
                Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Clean footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-text-muted">
        Medix Digital Healthcare Platform &copy; {new Date().getFullYear()} • Secure Telemedicine & Clinical EHR
      </footer>
    </div>
  );
}
