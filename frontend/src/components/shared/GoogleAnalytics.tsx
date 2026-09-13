"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, CONSENT_KEY } from "./CookieConsentBanner";

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (consent === "accepted") {
          setHasConsent(true);
        }

        const onConsentGranted = () => {
          setHasConsent(true);
        };

        window.addEventListener(CONSENT_EVENT, onConsentGranted);
        return () => {
          window.removeEventListener(CONSENT_EVENT, onConsentGranted);
        };
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Only load analytics script if gaId is provided and explicit consent has been granted
  if (!gaId || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
