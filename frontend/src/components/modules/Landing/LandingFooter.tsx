import Link from "next/link";
import { Activity, AlertCircle } from "lucide-react";
import LandingFooterLinks from "./LandingFooterLinks";
import LandingFooterSocial from "./LandingFooterSocial";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-surface text-foreground">
      {/* Emergency Medical Advisory Strip */}
      <div className="border-b border-border/60 bg-tint-warning-bg/40 px-4 py-3 text-xs text-tint-warning-text">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-warning" />
            <span className="font-bold">Medical Emergency Notice:</span>
            <span>
              If you or someone nearby is experiencing acute chest pain, severe bleeding, or difficulty breathing, please call your local emergency services (999 / 911) immediately.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-text-muted whitespace-nowrap">
            Telemedicine is for non-critical care
          </span>
        </div>
      </div>

      {/* Main Footer Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Accreditation Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -ml-1"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Activity className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                  Medix<span className="text-primary">.</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">
                  Clinical Healthcare
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
              Accredited digital healthcare infrastructure connecting patients with
              BMDC-verified physicians, automated triage, and cryptographically valid e-prescriptions.
            </p>

            {/* Clinical Headquarters & Contact Strip */}
            <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/70 max-w-sm">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">HQ:</span>
                <span>Level 4, Silicon Care Tower, Gulshan, Dhaka 1212</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Clinical Desk:</span>
                <a href="mailto:clinical@medix.health" className="text-primary hover:underline font-medium">
                  clinical@medix.health
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">24/7 Triage:</span>
                <a href="tel:+8801700000000" className="text-foreground hover:text-primary font-bold">
                  +880 1700-000000
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="flex size-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-medium text-foreground">Network Status:</span>
              <span className="text-secondary font-semibold">All Clinical Gateways Operational</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <LandingFooterLinks />
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-border/70 bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted text-center sm:text-left">
            &copy; {currentYear} Medix Healthcare Technologies Inc. All medical records encrypted under HIPAA & BMDC standards.
          </p>

          {/* Social / Support links */}
          <LandingFooterSocial />
        </div>
      </div>
    </footer>
  );
}
