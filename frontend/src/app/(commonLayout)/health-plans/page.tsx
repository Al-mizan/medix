import type { Metadata } from "next";
import Link from "next/link";
import { Clock, HeartPulse, Home, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Health Plans — Coming Soon",
  description:
    "Personalized health plans, preventive care packages, and wellness programs tailored to your medical needs are coming soon.",
};

export default function HealthPlansPage() {
  return (
    <div className="bg-background text-foreground py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-xl w-full text-center space-y-8">
            {/* Rounded card with subtle tint background */}
            <div className="relative inline-flex items-center justify-center">
              <div className="rounded-3xl bg-surface border border-border p-5 shadow-xs">
                <div className="size-16 sm:size-20 rounded-2xl bg-tint-primary-bg flex items-center justify-center">
                  <HeartPulse className="size-8 sm:size-10 text-primary" />
                </div>
              </div>
            </div>

            {/* Badge, Title & Description */}
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-primary-bg text-tint-primary-text border border-border">
                  <Clock className="size-3.5 text-primary" />
                  Coming Soon
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                Health Plans
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
                Personalized health plans, preventive care packages, and wellness programs tailored to your medical needs are coming soon.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
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
                variant="outline"
                className="w-full sm:w-auto gap-2 border-border text-foreground hover:bg-surface font-medium"
              >
                <Link href="/consultation">
                  <Stethoscope className="size-4" />
                  Find Doctors
                </Link>
              </Button>
            </div>

            {/* Subtext info */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs font-medium text-text-muted">
                Need medical assistance right now? Consult verified specialists anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}