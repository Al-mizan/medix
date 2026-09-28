"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Video,
  FileCheck2,
  ArrowRight,
  QrCode,
  Lock,
  Star,
  Mic,
  Camera,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WhyChooseSection() {
  return (
    <section id="care-continuum" className="py-16 sm:py-24 bg-surface border-b border-border/80 scroll-mt-20">
      <div id="why-choose" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Punchy headline, zero paragraphs */}
        <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3 py-1 text-xs font-semibold text-tint-primary-text">
            <Sparkles className="size-3.5 text-primary" />
            <span>How Medix Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            From symptom to recovery in three steps.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            No waiting rooms. No repetitive paperwork. Just connected, board-certified care when you need it.
          </p>
        </div>

        {/* 3-Step Visual Storyboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Step 01: Choose Specialist */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-tint-primary-bg text-primary font-extrabold text-sm border border-primary/15">
                  01
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold text-text-muted border-border/70">
                  Instant Match
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Select Your Specialist
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Filter vetted clinicians by symptoms, rating, and immediate real-time availability.
                </p>
              </div>

              {/* Tangible Mini Product Mockup: Doctor Profile Card */}
              <div className="rounded-xl border border-border/80 bg-surface/80 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 ring-2 ring-primary/20 rounded-xl">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                      alt="Doctor portrait"
                      className="object-cover rounded-xl"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-xl">
                      SJ
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground truncate">Dr. Sarah Jenkins</span>
                      <ShieldCheck className="size-3.5 text-secondary shrink-0" />
                    </div>
                    <p className="text-[11px] text-primary font-medium truncate">Cardiologist &bull; 12 yrs exp</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    <Star className="size-3 text-warning fill-warning" />
                    4.9 (142 reviews)
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-secondary">
                    <span className="size-1.5 rounded-full bg-secondary animate-pulse" />
                    Available Today
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-secondary shrink-0" />
              <span>100% BMDC Board-Certified</span>
            </div>
          </div>

          {/* Step 02: Video Consultation */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-tint-primary-bg text-primary font-extrabold text-sm border border-primary/15">
                  02
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold text-secondary border-secondary/30 bg-tint-secondary-bg">
                  Private HD Video
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Consult Face-to-Face
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Join a secure, encrypted video visit with live clinical notes and real-time vitals review.
                </p>
              </div>

              {/* Tangible Mini Product Mockup: Video Telehealth HUD */}
              <div className="rounded-xl border border-border/80 bg-zinc-900 text-white p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Encrypted Session
                  </span>
                  <span className="tabular-nums font-mono text-xs text-zinc-300">08:42</span>
                </div>

                <div className="h-20 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center gap-2 p-2 relative overflow-hidden">
                  <Video className="size-6 text-primary" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-zinc-100">Dr. Sarah Jenkins</div>
                    <div className="text-[10px] text-zinc-400">Reviewing clinical intake</div>
                  </div>
                  {/* Subtle live audio wave */}
                  <div className="absolute right-3 flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Lock className="size-3 text-emerald-400" />
                    256-bit WebRTC
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="size-5 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                      <Mic className="size-2.5" />
                    </span>
                    <span className="size-5 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                      <Camera className="size-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-text-muted flex items-center gap-1.5">
              <Lock className="size-3.5 text-secondary shrink-0" />
              <span>Zero App Downloads Needed</span>
            </div>
          </div>

          {/* Step 03: Instant Prescription & Follow-up */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-tint-primary-bg text-primary font-extrabold text-sm border border-primary/15">
                  03
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold text-text-muted border-border/70">
                  Instant Legal Rx
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Get Rx & 7-Day Care
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Receive verifiable digital prescriptions immediately, plus 7 days of free doctor chat.
                </p>
              </div>

              {/* Tangible Mini Product Mockup: Digital Rx Preview */}
              <div className="rounded-xl border border-border/80 bg-surface/80 p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <div className="text-xs font-bold text-foreground">Digital Prescription</div>
                    <div className="text-[10px] text-text-muted">BMDC Verified &bull; ID #MED-8492</div>
                  </div>
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center">
                    <QrCode className="size-4 text-foreground" />
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-2 space-y-1 text-[11px] border border-border/60">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>1. Tab. Atorvastatin 20mg</span>
                    <span className="text-text-muted">30d</span>
                  </div>
                  <div className="text-[10px] text-text-secondary">1 tablet nightly after food</div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="flex items-center gap-1 text-secondary font-semibold">
                    <FileCheck2 className="size-3 text-secondary" />
                    Pharmacy Valid
                  </span>
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <MessageSquare className="size-3" />
                    7-Day Chat
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-text-muted flex items-center gap-1.5">
              <FileCheck2 className="size-3.5 text-secondary shrink-0" />
              <span>Complimentary 7-Day Follow-Up</span>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Action Strip */}
        <div className="mt-12 rounded-2xl border border-border/80 bg-background/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-foreground">
              Ready to experience simple, connected healthcare?
            </h4>
            <p className="text-xs text-text-secondary">
              Consult with board-certified physicians from home in under 8 minutes.
            </p>
          </div>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold px-5 shadow-xs shrink-0"
          >
            <Link href="/consultation" className="flex items-center gap-2">
              <span>Find a Doctor Now</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

