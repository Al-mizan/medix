import Link from "next/link";
import { Shield } from "lucide-react";

export default function LandingFooterLinks() {
  return (
    <>
      {/* Column 1: Platform */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Platform
        </h3>
        <ul className="space-y-2.5 text-sm text-text-secondary">
          <li>
            <Link
              href="/consultation"
              className="hover:text-primary transition-colors"
            >
              Find Doctors
            </Link>
          </li>
          <li>
            <Link
              href="/#specialties"
              className="hover:text-primary transition-colors"
            >
              Medical Specialties
            </Link>
          </li>
          <li>
            <Link
              href="/#why-choose"
              className="hover:text-primary transition-colors"
            >
              AI Assistant
            </Link>
          </li>
          <li>
            <Link
              href="/consultation"
              className="hover:text-primary transition-colors"
            >
              Book Consultation
            </Link>
          </li>
        </ul>
      </div>

      {/* Column 2: Patients */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Patients
        </h3>
        <ul className="space-y-2.5 text-sm text-text-secondary">
          <li>
            <Link
              href="/login"
              className="hover:text-primary transition-colors"
            >
              Patient Sign In
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="hover:text-primary transition-colors"
            >
              Create Account
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors"
            >
              Health Records
            </Link>
          </li>
          <li>
            <Link
              href="/consultation"
              className="hover:text-primary transition-colors"
            >
              Prescriptions & PDF
            </Link>
          </li>
        </ul>
      </div>

      {/* Column 3: Legal & Trust */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Legal & Trust
        </h3>
        <ul className="space-y-2.5 text-sm text-text-secondary">
          <li>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </li>
          <li>
            <span className="flex items-center gap-1.5 text-text-muted cursor-not-allowed">
              <Shield className="size-3.5 text-secondary" />
              HIPAA Compliant
            </span>
          </li>
          <li>
            <span className="text-text-muted cursor-not-allowed">
              Medical Disclaimer
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}
