import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  FileText,
  Check,
} from "lucide-react";

interface FeatureCard {
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tintBg: string;
  tintText: string;
  iconColor: string;
  bullets: string[];
}

const features: FeatureCard[] = [
  {
    title: "100% Verified Specialists",
    badge: "Clinical Excellence",
    description:
      "Every physician undergoes strict verification including BMDC / state medical licensing, board certifications, and clinical background vetting.",
    icon: ShieldCheck,
    tintBg: "bg-tint-secondary-bg",
    tintText: "text-tint-secondary-text",
    iconColor: "text-secondary",
    bullets: [
      "Rigorous credential verification",
      "Transparent patient reviews & ratings",
      "Specialty-specific clinical experience",
    ],
  },
  {
    title: "Instant AI Health Assistant",
    badge: "Assist Violet AI",
    description:
      "24/7 intelligent symptom triage and medical knowledge guidance powered by Medix's clinical RAG architecture with cited medical sources.",
    icon: Sparkles,
    tintBg: "bg-tint-ai-bg",
    tintText: "text-tint-ai-text",
    iconColor: "text-ai",
    bullets: [
      "Immediate pre-consultation triage",
      "Context-aware clinical question answering",
      "Strict separation between AI & clinician opinions",
    ],
  },
  {
    title: "Seamless & Secure Payments",
    badge: "Stripe Protected",
    description:
      "End-to-end encrypted transactions powered by Stripe. Transparent consultation fees with instant receipts and hassle-free automated refunds.",
    icon: CreditCard,
    tintBg: "bg-tint-primary-bg",
    tintText: "text-tint-primary-text",
    iconColor: "text-primary",
    bullets: [
      "PCI-DSS Level 1 payment compliance",
      "Zero hidden consultation fees",
      "Instant downloadable digital invoices",
    ],
  },
  {
    title: "Verifiable Digital Prescriptions",
    badge: "Paperless Healthcare",
    description:
      "Receive cryptographically signed PDF prescriptions immediately after consultation with dosage schedules, diagnostics, and doctor instructions.",
    icon: FileText,
    tintBg: "bg-tint-accent-bg",
    tintText: "text-tint-accent-text",
    iconColor: "text-accent",
    bullets: [
      "Instant PDF download with QR verification",
      "Unified medical records & lab report storage",
      "Permanent chronological history",
    ],
  },
];

export default function WhyChooseSection() {
  return (
    <section id="why-choose" className="py-16 sm:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-tint-primary-bg px-3 py-1 text-xs font-semibold text-tint-primary-text">
            Why Patients Choose Medix
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A New Standard for Digital Healthcare
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Designed from the ground up to replace fragmented clinic visits with a connected,
            secure, and empathetic medical experience.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-background p-7 sm:p-8 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div
                      className={`flex size-14 items-center justify-center rounded-2xl ${feature.tintBg} ${feature.iconColor}`}
                    >
                      <Icon className="size-7" />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${feature.tintBg} ${feature.tintText}`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bullets list */}
                <div className="mt-6 pt-5 border-t border-border/70 space-y-2">
                  {feature.bullets.map((bullet, bulletIdx) => (
                    <div
                      key={bulletIdx}
                      className="flex items-center gap-2.5 text-xs text-text-secondary"
                    >
                      <div className="flex size-4 items-center justify-center rounded-full bg-tint-secondary-bg text-secondary shrink-0">
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
