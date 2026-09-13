"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw, ShieldAlert } from "lucide-react";
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
    console.error("Root Error Boundary caught:", error);
  }, [error]);

  const handleReset = () => {
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-danger/20 selection:text-danger">
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

          <span className="text-xs font-semibold text-tint-danger-text bg-tint-danger-bg border border-danger/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <ShieldAlert className="size-3.5" />
            System Resilience
          </span>
        </div>
      </header>

      {/* Main Error Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Animated decorative alert icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-tint-danger-bg/70 blur-xl pointer-events-none" />
            <div className="relative size-24 sm:size-28 rounded-3xl bg-surface border border-danger/30 shadow-md flex items-center justify-center text-danger">
              <AlertTriangle className="size-12 sm:size-14 text-danger animate-bounce stroke-[1.75]" />
              <div className="absolute -top-2 -right-2 size-8 rounded-full bg-destructive text-destructive-foreground font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                !
              </div>
            </div>
          </div>

          {/* Error Headings */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-warning-bg text-tint-warning-text border border-warning/20">
              System Notice • Execution Disrupted
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Something went wrong!
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
              An unexpected interruption occurred while loading this healthcare view. Your medical data remains completely secure and untouched.
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
              <Link href="/dashboard">
                <Activity className="size-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Optional expandable technical details */}
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
                <p className="font-semibold text-danger">{error.name}: {error.message || "Unknown error"}</p>
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
      </main>

      {/* Clean footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-text-muted">
        Medix Digital Healthcare Platform &copy; {new Date().getFullYear()} • Secure Telemedicine & Clinical EHR
      </footer>
    </div>
  );
}
