import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, Database, Cookie, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & Clinical Data Governance",
  description:
    "Learn how Medix protects your personal health data, electronic medical records (EHR), and billing transactions in accordance with healthcare privacy standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3.5 py-1 text-xs font-semibold text-tint-primary-text">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Healthcare Data Protection & HIPAA Alignment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Effective Date: September 14, 2026 • Version 2.4
          </p>
        </div>

        {/* Overview Box */}
        <div className="rounded-2xl border border-primary/20 bg-tint-primary-bg/40 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            Our Clinical Privacy Commitment
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            At Medix Healthcare Technologies (&quot;Medix&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), protecting the confidentiality, integrity, and security of your personal health data is fundamental to our clinical mission. This Privacy Policy details how we handle Protected Health Information (PHI), consultation records, biometric metrics, and financial transactions across our digital health platform.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-text-secondary">
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Database className="size-5 text-secondary" />
              1. Information We Collect
            </h3>
            <p>
              To provide personalized medical consultations and maintain your longitudinal Electronic Health Record (EHR), Medix collects information in three main categories:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Patient & Clinician Identity:</strong> Name, verified email address, contact phone number, emergency contact details, and account credentials authenticated via BetterAuth.
              </li>
              <li>
                <strong className="text-foreground">Clinical & Medical Records:</strong> Medical history, diagnosed chronic conditions, blood group, allergies, vital signs, prescription records, doctor notes, and diagnostic documents/reports uploaded to encrypted cloud storage.
              </li>
              <li>
                <strong className="text-foreground">Consultation & Telehealth Metadata:</strong> Appointment scheduling timestamps, session durations, and signaling metadata required to facilitate WebRTC peer-to-peer encrypted video consultations.
              </li>
              <li>
                <strong className="text-foreground">Billing Data:</strong> Transaction tokens, invoices, and payment statuses processed securely via Stripe. Medix does not store raw credit/debit card numbers on its servers.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-accent" />
              2. How We Utilize Clinical Data
            </h3>
            <p>
              Your data is utilized exclusively for legitimate clinical and operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enabling licensed medical practitioners to deliver telemedicine consultations and author legal medical prescriptions.</li>
              <li>Providing real-time schedule slot reservation and automated invoice delivery.</li>
              <li>Powering our opt-in clinical AI knowledge retrieval assistant (RAG) to provide verified clinical guidelines and operational FAQs. Medical notes are never used to train public foundational LLM models.</li>
              <li>Complying with statutory medical record retention mandates and legal health audit requirements.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              3. Telemedicine Encryption & Technical Safeguards
            </h3>
            <p>
              All video and audio consultations between patients and doctors use direct Peer-to-Peer (P2P) WebRTC connections encrypted via Secure Real-Time Transport Protocol (SRTP). Telemedicine video streams are never recorded or stored on intermediate servers without explicit prior written consent from all session participants.
            </p>
            <p>
              Data at rest (PostgreSQL database records and Cloudinary diagnostic files) is secured with AES-256 encryption. Data in transit across all endpoints is guarded by TLS 1.3 encryption.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="size-5 text-secondary" />
              4. Cookies & Telemetry Consent
            </h3>
            <p>
              Medix utilizes essential cookies strictly necessary to maintain authenticated sessions, secure token storage, and anti-tampering guards. Performance telemetry (Google Analytics 4) is loaded strictly on an opt-in basis following your affirmative consent through our Cookie Banner. You may withdraw consent or toggle telemetry at any time.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              5. Patient Rights & Record Portability
            </h3>
            <p>
              Patients retain statutory rights under applicable digital health data governance:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to inspect, review, and download digital copies of all issued prescriptions and medical reports.</li>
              <li>The right to request rectification of inaccurate personal demographics.</li>
              <li>The right to request account deactivation, subject to mandatory medical statutory retention periods required by healthcare law.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 pt-6 border-t border-border/80">
            <h3 className="text-xl font-bold text-foreground">
              6. Data Protection Officer & Clinical Contact
            </h3>
            <p>
              For inquiries regarding health data governance, HIPAA alignment, or exercising your patient privacy rights, contact our Data Protection Officer:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-medium text-xs">
                  <MapPin className="size-4" />
                  Headquarters
                </div>
                <p className="text-xs text-foreground font-semibold">
                  Medix Healthcare Technologies
                </p>
                <p className="text-xs text-text-secondary">
                  Level 4, Silicon Care Tower, Dhaka 1212, Bangladesh
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-secondary font-medium text-xs">
                  <Mail className="size-4" />
                  Privacy & Support
                </div>
                <p className="text-xs text-foreground font-semibold">
                  privacy@medix.health
                </p>
                <p className="text-xs text-text-secondary">
                  support@medix.health
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-accent font-medium text-xs">
                  <Phone className="size-4" />
                  Clinical Helpline
                </div>
                <p className="text-xs text-foreground font-semibold">
                  +880 1700-000000
                </p>
                <p className="text-xs text-text-secondary">
                  Available 24/7 for Patient Support
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-border/80 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} Medix Healthcare Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/consultation" className="hover:text-primary transition-colors">
              Find Doctors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
