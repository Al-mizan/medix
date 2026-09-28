"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("Dashboard Error Boundary caught:", error);
  }, [error]);

  const handleReset = () => {
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 selection:bg-danger/20 selection:text-danger">
      <div className="max-w-xl w-full rounded-xl border border-border/80 bg-surface p-6 sm:p-8 text-center shadow-xs space-y-6">
        {/* Compact danger-tinted icon badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-tint-danger-bg/70 blur-lg pointer-events-none" />
          <div className="relative size-16 sm:size-20 rounded-2xl bg-surface border border-danger/30 shadow-md flex items-center justify-center text-danger">
            <AlertTriangle className="size-8 sm:size-10 text-danger stroke-[1.75]" />
            <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-destructive text-destructive-foreground font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
              !
            </div>
          </div>
        </div>

        {/* Headings & Reassuring message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tint-danger-bg text-tint-danger-text border border-danger/20">
            <AlertTriangle className="size-3" />
            Dashboard Notice • Execution Disrupted
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            An unexpected error occurred while loading this dashboard view. Your clinical data and medical records remain completely secure and unaffected.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Button
            onClick={handleReset}
            disabled={isPending}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs transition-all text-sm h-9 px-4"
          >
            <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Retrying..." : "Try again"}
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border/80 hover:bg-muted/40 font-medium text-sm h-9 px-4"
          >
            <Link href="/dashboard">
              <Activity className="size-4" />
              Go to Dashboard Home
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full sm:w-auto gap-2 text-text-secondary hover:text-foreground text-sm h-9 px-3"
          >
            <Link href="/">
              <Home className="size-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Expandable technical details */}
        <div className="pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <span>{showDetails ? "Hide Technical Details" : "View Technical Diagnostics"}</span>
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 rounded-lg bg-muted/40 border border-border/80 text-left font-mono text-xs text-text-secondary space-y-1 overflow-x-auto shadow-inner">
              <p className="font-semibold text-danger">
                {error.name}: {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-text-muted">Error Digest: {error.digest}</p>
              )}
              {error.stack && (
                <pre className="text-[11px] text-text-muted/80 whitespace-pre-wrap mt-1.5 max-h-36 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
