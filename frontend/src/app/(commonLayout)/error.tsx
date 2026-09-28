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
    console.error("Common Layout Error Boundary caught:", error);
  }, [error]);

  const handleReset = () => {
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-danger/20 selection:text-danger">
      <div className="max-w-3xl mx-auto w-full">
        <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-10 text-center shadow-xs space-y-8">
          {/* Animated decorative alert icon badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-tint-danger-bg/70 blur-xl pointer-events-none" />
            <div className="relative size-20 sm:size-24 rounded-3xl bg-surface border border-danger/30 shadow-md flex items-center justify-center text-danger">
              <AlertTriangle className="size-10 sm:size-12 text-danger animate-bounce stroke-[1.75]" />
              <div className="absolute -top-2 -right-2 size-7 rounded-full bg-destructive text-destructive-foreground font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                !
              </div>
            </div>
          </div>

          {/* Error Headings & Reassuring Message */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-danger-bg text-tint-danger-text border border-danger/20">
              <AlertTriangle className="size-3.5" />
              Service Interruption • Page Error
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Something went wrong
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
              An unexpected interruption occurred while loading this healthcare view. Your medical data, consultations, and account information remain completely secure and untouched.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleReset}
              disabled={isPending}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs transition-all"
            >
              <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
              {isPending ? "Retrying..." : "Try again"}
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto gap-2 border-border/80 hover:bg-muted/40 font-medium"
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
              <Link href="/consultation">
                <Activity className="size-4" />
                Find Doctors
              </Link>
            </Button>
          </div>

          {/* Expandable technical details */}
          <div className="pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <span>{showDetails ? "Hide Technical Details" : "View Technical Diagnostics"}</span>
              {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/80 text-left font-mono text-xs text-text-secondary space-y-1 overflow-x-auto shadow-inner">
                <p className="font-semibold text-danger">
                  {error.name}: {error.message || "Unknown error"}
                </p>
                {error.digest && (
                  <p className="text-text-muted">Error Digest: {error.digest}</p>
                )}
                {error.stack && (
                  <pre className="text-[11px] text-text-muted/80 whitespace-pre-wrap mt-2 max-h-40 overflow-y-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
