"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CONSENT_KEY = "medix_cookie_consent";
export const CONSENT_EVENT = "medix_consent_granted";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Handle local storage disabled/sandboxed environments gracefully
      setIsVisible(false);
    }
  }, []);

  const handleConsent = (level: "accepted" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, level);
      if (level === "accepted") {
        window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { level } }));
      }
    } catch (e) {
      console.warn("Unable to save cookie preferences:", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md p-5 shadow-xl transition-all">
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-tint-primary-bg text-primary border border-primary/20">
            <Cookie className="size-5" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>Privacy & Cookies</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary bg-tint-secondary-bg px-1.5 py-0.5 rounded-md">
                  <ShieldCheck className="size-3" />
                  HIPAA Aware
                </span>
              </h4>
              <button
                type="button"
                onClick={() => handleConsent("essential")}
                aria-label="Dismiss cookie notice"
                className="text-text-muted hover:text-foreground transition-colors p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              We use essential cookies to maintain secure sessions and operational integrity. With your consent, we also utilize anonymized telemetry to optimize clinical workflows. See our{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => handleConsent("accepted")}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs px-3.5 py-1.5 h-8 shadow-xs"
              >
                Accept All
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleConsent("essential")}
                className="border-border text-foreground hover:bg-muted font-medium text-xs px-3.5 py-1.5 h-8"
              >
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
