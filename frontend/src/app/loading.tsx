import { Activity } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Soft glowing concentric rings */}
        <div className="absolute size-24 rounded-full bg-tint-primary-bg animate-ping opacity-60 pointer-events-none" />
        <div className="absolute size-20 rounded-full bg-primary/10 animate-pulse pointer-events-none" />

        {/* Central brand icon */}
        <div className="relative size-16 rounded-2xl bg-surface border border-border/80 shadow-md flex items-center justify-center text-primary">
          <Activity className="size-8 text-primary animate-pulse stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-6 space-y-1.5 max-w-xs">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          Medix Digital Healthcare
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Loading secure clinical portal...
        </p>
      </div>

      {/* Modern pulsing status bar */}
      <div className="mt-5 w-44 h-1.5 bg-muted/70 rounded-full overflow-hidden">
        <div className="h-full bg-primary/80 rounded-full w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
