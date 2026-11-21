"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CONSENT_KEY = "medix_cookie_consent";
export const CONSENT_EVENT = "medix_consent_granted";

export const getConsentCookie = (name: string = CONSENT_KEY): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setPersistentConsentCookie = (level: "accepted" | "essential") => {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(level)}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
};

export const clearAnalyticsCookies = () => {
  if (typeof document === "undefined") return;
  const cookies = document.cookie.split(";");
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const domainParts = hostname.split(".");
  const domains = [
    "",
    hostname,
    `.${hostname}`,
    domainParts.length > 1 ? `.${domainParts.slice(-2).join(".")}` : "",
  ].filter(Boolean);

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name.startsWith("_ga") || name.startsWith("_gid") || name.startsWith("_gat")) {
      for (const domain of domains) {
        const domainAttr = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
      }
    }
  }
};

const subscribeToConsent = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
};

export const getConsentSnapshot = () => {
  try {
    const local = localStorage.getItem(CONSENT_KEY);
    if (local !== null) return true;
    const cookie = getConsentCookie(CONSENT_KEY);
    return cookie !== null;
  } catch {
    return true;
  }
};

const getServerConsentSnapshot = () => true;

export default function CookieConsentBanner() {
  const hasSavedConsent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);

  const handleConsent = (level: "accepted" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, level);
      setPersistentConsentCookie(level);
      if (level === "essential") {
        clearAnalyticsCookies();
      }
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { level } }));
    } catch (e) {
      console.warn("Unable to save cookie preferences:", e);
    }
    setDismissed(true);
  };

  if (hasSavedConsent || dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-19 left-2.5 right-2.5 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="rounded-xl sm:rounded-2xl border border-border/90 bg-surface/95 backdrop-blur-xl p-3 sm:p-4.5 shadow-lg sm:shadow-xl transition-all">
        {/* Mobile Compact View */}
        <div className="sm:hidden flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Cookie className="size-4 text-primary shrink-0" />
            <p className="text-[11px] text-text-secondary leading-tight truncate">
              We use essential cookies.{" "}
              <Link href="/privacy" className="underline text-primary font-medium">
                Privacy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => handleConsent("accepted")}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-[11px] h-7 px-2.5 rounded-lg shadow-2xs"
            >
              Accept
            </Button>
            <button
              type="button"
              onClick={() => handleConsent("essential")}
              aria-label="Dismiss cookie notice"
              className="text-text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-tint-primary-bg text-primary border border-primary/20">
            <Cookie className="size-4.5" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                <span>Privacy & Cookies</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-tint-secondary-text bg-tint-secondary-bg px-1.5 py-0.5 rounded-md shrink-0">
                  <ShieldCheck className="size-3 text-secondary" />
                  Confidential
                </span>
              </h4>
              <button
                type="button"
                onClick={() => handleConsent("essential")}
                aria-label="Dismiss cookie notice"
                className="text-text-muted hover:text-foreground transition-colors p-1 -mr-1"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              We use essential cookies to maintain secure sessions. With your consent, we also utilize anonymized telemetry to optimize clinical workflows. See our{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex items-center gap-2 pt-0.5">
              <Button
                type="button"
                size="sm"
                onClick={() => handleConsent("accepted")}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-3.5 py-1.5 h-8 shadow-xs rounded-lg"
              >
                Accept All
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleConsent("essential")}
                className="border-border text-foreground hover:bg-muted font-medium text-xs px-3.5 py-1.5 h-8 rounded-lg"
              >
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
