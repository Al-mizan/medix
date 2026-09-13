import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Calendar, Home, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thank You | Medix Healthcare",
  description:
    "Thank you for choosing Medix Digital Healthcare. Your request or clinical registration has been safely received.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-tint-secondary-bg blur-xl pointer-events-none opacity-80" />
          <div className="relative size-20 sm:size-24 rounded-3xl bg-surface border border-secondary/30 shadow-lg flex items-center justify-center text-secondary">
            <CheckCircle2 className="size-10 sm:size-12 stroke-[2.2]" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-secondary-bg text-tint-secondary-text border border-secondary/20">
            <ShieldCheck className="size-3.5" />
            Confirmation Received
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Thank You for Choosing Medix
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
            Your request has been processed securely. A confirmation with appointment details and next clinical steps has been routed to your registered email.
          </p>
        </div>

        {/* Quick Reassurance Box */}
        <div className="rounded-2xl border border-border/80 bg-surface/60 p-5 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <span>What happens next?</span>
          </p>
          <ul className="text-text-secondary space-y-1.5 list-disc pl-4">
            <li>You can view all booked consultations directly in your patient portal.</li>
            <li>Consultation video links become active 10 minutes before session time.</li>
            <li>Need immediate help? Our triage line is available 24/7.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-sm"
          >
            <Link href="/consultation">
              <Calendar className="size-4" />
              <span>Browse Specialists</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border hover:bg-muted font-medium"
          >
            <Link href="/dashboard">
              <span>Patient Dashboard</span>
              <ArrowRight className="size-4 text-text-muted" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full sm:w-auto gap-2 font-medium text-text-secondary"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>Home</span>
            </Link>
          </Button>
        </div>

        {/* Emergency helpline reminder */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs text-text-muted flex items-center justify-center gap-1.5">
            <PhoneCall className="size-3.5 text-secondary" />
            <span>Need immediate clinical coordination? Call <a href="tel:+8801700000000" className="text-foreground font-semibold underline">+880 1700-000000</a></span>
          </p>
        </div>
      </div>
    </div>
  );
}
