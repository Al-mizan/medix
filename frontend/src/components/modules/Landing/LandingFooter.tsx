import Link from "next/link";
import { Activity } from "lucide-react";
import LandingFooterLinks from "./LandingFooterLinks";
import LandingFooterSocial from "./LandingFooterSocial";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface text-foreground">
      {/* Top Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Activity className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Medix<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              Modern, accessible, and intelligent healthcare infrastructure. Connecting patients
              with verified specialists and AI-guided clinical workflows.
            </p>

            {/* Real Headquarters & Support Contact Info */}
            <div className="space-y-1.5 text-xs text-text-secondary pt-1 border-t border-border/60 max-w-sm">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">HQ:</span>
                <span>Level 4, Silicon Care Tower, Dhaka 1212, Bangladesh</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Email:</span>
                <a href="mailto:support@medix.health" className="text-primary hover:underline">
                  support@medix.health
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Phone:</span>
                <a href="tel:+8801700000000" className="text-foreground hover:text-primary">
                  +880 1700-000000 (24/7 Triage)
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-secondary pt-1">
              <span className="flex size-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-medium text-foreground">System Status:</span>
              <span className="text-secondary font-medium">All systems operational</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <LandingFooterLinks />
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-border/80 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted text-center sm:text-left">
            &copy; {currentYear} Medix Healthcare Technologies Inc. All rights reserved.
            Built with clinical integrity and care.
          </p>

          {/* Social placeholder links */}
          <LandingFooterSocial />
        </div>
      </div>
    </footer>
  );
}
