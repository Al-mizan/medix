import Link from "next/link";
import {
  Video,
  Mic,
  Activity,
  Calendar,
  MessageSquare,
  PhoneOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroPreviewCard() {

  return (
    <div className="relative mx-auto w-full max-w-lg rounded-2xl border border-border/80 bg-surface shadow-xl overflow-hidden transition-all">
      {/* App Window Chrome Header */}
      <div className="border-b border-border/70 bg-muted/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <span className="text-xs font-semibold text-text-secondary pl-2 border-l border-border/60">
            Medix Video Room
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
          <span className="size-2 rounded-full bg-secondary animate-pulse" />
          <span>Connected · Encrypted</span>
        </div>
      </div>

      {/* Main Interactive Product Showcase */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Visual Viewport: Doctor Video Call Frame */}
        <div className="relative aspect-4/3 sm:aspect-16/11 rounded-xl bg-gradient-to-b from-[#0D1822] to-[#142332] text-white p-4 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Subtle Grid / Clean Clinical Backdrop */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#38BDF8 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Top Call Info Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 border border-white/10 text-xs">
              <span className="size-2 rounded-full bg-secondary animate-ping" />
              <span className="font-semibold text-white/90">04:18</span>
              <span className="text-white/40">|</span>
              <span className="text-white/80">Dr. Sarah Jenkins</span>
            </div>

            <Badge variant="secondary" className="bg-white/15 text-white border-none text-[11px] font-medium backdrop-blur-xs">
              HD 1080p
            </Badge>
          </div>

          {/* Doctor Visual Avatar & Speaking Waves */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center space-y-3">
            <div className="relative">
              <div className="size-20 sm:size-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-lg">
                <div className="size-full rounded-full bg-[#1A2D3F] flex items-center justify-center text-2xl font-extrabold text-white">
                  DR
                </div>
              </div>
              <span className="absolute bottom-1 right-1 size-5 rounded-full bg-secondary border-2 border-[#142332] flex items-center justify-center">
                <Activity className="size-3 text-white" />
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Dr. Sarah Jenkins, MD
              </h3>
              <p className="text-xs text-white/70">
                Senior Cardiologist · BMDC #84920
              </p>
            </div>

            {/* Audio Waveform Animation Simulation */}
            <div className="flex items-center gap-1 h-4 pt-1">
              <span className="w-1 h-3 rounded-full bg-primary animate-pulse" />
              <span className="w-1 h-5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
              <span className="w-1 h-6 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "100ms" }} />
              <span className="w-1 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "250ms" }} />
            </div>
          </div>

          {/* Bottom Floating Visual Pill: Live Vitals or Prescription */}
          <div className="relative z-10 flex items-end justify-between gap-2 pt-2">
            {/* Live Vitals HUD */}
            <div className="rounded-lg bg-black/50 backdrop-blur-md border border-white/15 px-3 py-2 text-xs flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-white">
                <Activity className="size-3.5 text-accent animate-pulse" />
                <span className="font-mono font-bold text-sm">72</span>
                <span className="text-[10px] text-white/60">BPM</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="text-[11px] text-white/90">
                BP: <span className="font-semibold text-secondary">120/80</span>
              </div>
            </div>

            {/* Floating Mini Patient Self-View */}
            <div className="size-14 sm:size-16 rounded-lg bg-black/60 border border-white/20 p-1 flex flex-col justify-end text-[9px] text-white/80 font-medium">
              <div className="size-full rounded bg-white/10 flex items-center justify-center text-white/60">
                You
              </div>
            </div>
          </div>
        </div>

        {/* Live Call Controls Bar */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5 border border-border/80">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-muted text-xs transition-colors"
              aria-label="Mute microphone"
            >
              <Mic className="size-4 text-foreground" />
            </button>
            <button
              type="button"
              className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-muted text-xs transition-colors"
              aria-label="Toggle camera"
            >
              <Video className="size-4 text-foreground" />
            </button>
            <button
              type="button"
              className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-muted text-xs transition-colors"
              aria-label="Open clinical chat"
            >
              <MessageSquare className="size-4 text-foreground" />
            </button>
          </div>

          {/* End Call / Leave room visual indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-text-secondary hidden sm:inline">
              Instant PDF Rx Ready
            </span>
            <div className="size-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
              <PhoneOff className="size-4" />
            </div>
          </div>
        </div>

        {/* 3 Quick Visual Value Badges (Zero text bloat) */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-border/60 bg-surface p-2 space-y-0.5">
            <span className="font-bold text-foreground text-sm block">0 Wait</span>
            <span className="text-[10px] text-text-muted">Instant Connect</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-surface p-2 space-y-0.5">
            <span className="font-bold text-primary text-sm block">100%</span>
            <span className="text-[10px] text-text-muted">Board Certified</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-surface p-2 space-y-0.5">
            <span className="font-bold text-secondary text-sm block">Valid Rx</span>
            <span className="text-[10px] text-text-muted">Instant PDF</span>
          </div>
        </div>

        {/* Primary Booking Trigger */}
        <Button
          asChild
          className="w-full bg-accent text-accent-foreground hover:bg-accent-hover font-semibold h-11 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Link href="/consultation" className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            <span>Start Consultation with On-Duty Specialist</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
