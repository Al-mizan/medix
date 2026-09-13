import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroPreviewCard() {
  return (
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
  );
}
