import Link from "next/link";
import { ShieldCheck, FileCheck2 } from "lucide-react";

export default function LandingFooterLinks() {
  return (
    <>
      {/* Column 1: Clinical Platform */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Clinical Platform
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
          <li>
            <Link
              href="/consultation"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Find Board Specialists
            </Link>
          </li>
          <li>
            <Link
              href="/#specialties"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Medical Departments
            </Link>
          </li>
          <li>
            <Link
              href="/#care-continuum"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              The Care Continuum
            </Link>
          </li>
          <li>
            <Link
              href="/#clinical-standards"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Clinical Quality Standards
            </Link>
          </li>
        </ul>
      </div>

      {/* Column 2: Patient Portal */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Patient Portal
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
          <li>
            <Link
              href="/login"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Patient Sign In
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Create Medical Account
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Health Records (EHR)
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/my-prescriptions"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded font-medium"
            >
              Prescriptions & PDF
            </Link>
          </li>
        </ul>
      </div>

      {/* Column 3: Legal & Trust Governance */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Governance & Trust
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
          <li>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Privacy Policy & HIPAA
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              Terms of Medical Service
            </Link>
          </li>
          <li className="flex items-center gap-1.5 text-text-secondary font-medium">
            <ShieldCheck className="size-4 text-secondary shrink-0" />
            <span>BMDC Verified Prescribers</span>
          </li>
          <li className="flex items-center gap-1.5 text-text-muted text-xs">
            <FileCheck2 className="size-3.5 text-primary shrink-0" />
            <span>Cryptographic Rx Protocol</span>
          </li>
        </ul>
      </div>
    </>
  );
}
