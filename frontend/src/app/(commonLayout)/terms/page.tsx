import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, DollarSign, FileCheck, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service & Telemedicine Agreement",
  description:
    "Terms and conditions governing clinical consultations, appointment cancellations, Stripe payment refunds, and telemedicine services on Medix.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-tint-secondary-bg px-3.5 py-1 text-xs font-semibold text-tint-secondary-text">
            <FileCheck className="size-3.5 text-secondary" />
            <span>Clinical Governance & Patient Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Effective Date: September 14, 2026 • Version 2.4
          </p>
        </div>

        {/* Medical Emergency Warning Callout */}
        <div className="rounded-2xl border border-danger/30 bg-tint-danger-bg/50 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-danger font-bold text-base sm:text-lg">
            <AlertCircle className="size-5 shrink-0" />
            <span>Emergency Medical Care Notice</span>
          </div>
          <p className="text-sm leading-relaxed text-tint-danger-text">
            <strong>MEDIX IS NOT AN EMERGENCY DISPATCH SERVICE.</strong> If you or someone under your care is experiencing severe chest pain, shortness of breath, acute hemorrhage, suspected stroke, severe allergic reaction, or any life-threatening condition, immediately dial your local emergency services (e.g., <strong>999</strong> or <strong>911</strong>) or proceed immediately to the nearest hospital emergency room.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-text-secondary">
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="size-5 text-primary" />
              1. Platform Scope & Doctor-Patient Relationship
            </h3>
            <p>
              Medix Healthcare Technologies operates a digital health platform connecting patients with verified, licensed healthcare practitioners (&quot;Doctors&quot; or &quot;Clinicians&quot;).
            </p>
            <p>
              The clinical doctor-patient relationship is established directly between you and the consulting physician during the booked appointment. Medix facilitates scheduling, secure WebRTC audio/video communications, electronic health record management, and billing infrastructure, but does not interfere with the independent medical judgment of licensed practitioners.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="size-5 text-secondary" />
              2. Appointment Booking, Cancellations & Refund Policy
            </h3>
            <p>
              Appointments represent reserved clinical time allocated to a patient. To maintain schedule integrity for both patients and clinicians, the following cancellation and refund rules strictly apply:
            </p>
            <div className="rounded-xl border border-border/80 bg-surface p-5 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Cancellation &gt; 2 Hours Before Scheduled Slot:</strong>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    Patients may cancel an appointment up to 2 hours prior to the scheduled start time to receive a <strong>100% automated refund</strong> credited back through Stripe to the original payment method.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-border/60">
                <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Cancellation &lt; 2 Hours or Patient No-Show:</strong>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    Cancellations initiated within 2 hours of the appointment or failure to join the consultation room within 15 minutes of the start time are non-refundable, as the physician&apos;s schedule was reserved.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-border/60">
                <DollarSign className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Clinician Cancellation or Platform Unavailability:</strong>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    If a doctor cancels an appointment or is unable to attend due to unforeseen circumstances, the patient is entitled to an immediate priority reschedule or an unconditional full refund.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              3. Telemedicine Prescriptions & Clinical Orders
            </h3>
            <p>
              Following a clinical consultation, doctors may issue electronic prescriptions at their sole professional discretion. Clinicians reserve the right to decline prescribing narcotics, controlled substances, or medications requiring mandatory physical palpation or emergency diagnostics. Digital prescriptions are delivered in cryptographically signed PDF format with a unique verification identifier.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              4. Patient Obligations & Accurate Health Data
            </h3>
            <p>
              As a patient using the platform, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete health history, medication lists, and allergy records.</li>
              <li>Maintain the confidentiality of your Medix portal credentials and BetterAuth tokens.</li>
              <li>Ensure you have adequate internet bandwidth, functional webcam/microphone, and a private, quiet setting during consultations.</li>
              <li>Refrain from unauthorized audio or video recording of consultations without mutual agreement.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              5. Governing Law & Clinical Jurisdiction
            </h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Bangladesh and applicable telemedicine regulations established by the Bangladesh Medical & Dental Council (BM&DC) and the Directorate General of Health Services (DGHS). Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Dhaka.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-border/80">
            <h3 className="text-xl font-bold text-foreground">
              6. Contact for Clinical Governance & Inquiries
            </h3>
            <p>
              For questions regarding clinical contracts, billing inquiries, or provider terms:
            </p>
            <div className="rounded-xl border border-border/80 bg-surface p-4 text-xs sm:text-sm space-y-1">
              <p className="font-semibold text-foreground">Medix Healthcare Technologies Inc.</p>
              <p className="text-text-secondary">Level 4, Silicon Care Tower, Dhaka 1212, Bangladesh</p>
              <p className="text-text-secondary">Email: <a href="mailto:support@medix.health" className="text-primary underline">support@medix.health</a> • Telephone: +880 1700-000000</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-border/80 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} Medix Healthcare Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
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
