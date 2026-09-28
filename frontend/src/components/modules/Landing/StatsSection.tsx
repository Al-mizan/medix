import {
  Clock,
  ShieldCheck,
  HeartPulse,
  Lock,
  Star,
  Sparkles,
  FileCheck2,
} from "lucide-react";

interface ClinicalMetricItem {
  metric: string;
  metricLabel: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  statusTag: string;
}

const clinicalMetrics: ClinicalMetricItem[] = [
  {
    metric: "< 8 min",
    metricLabel: "Average Wait Time",
    subLabel: "Immediate specialist triage",
    icon: Clock,
    statusTag: "Live Monitored",
  },
  {
    metric: "100%",
    metricLabel: "Board Certified",
    subLabel: "BMDC verified physicians",
    icon: ShieldCheck,
    statusTag: "Zero Exceptions",
  },
  {
    metric: "15,000+",
    metricLabel: "Patients Treated",
    subLabel: "99.2% care resolution index",
    icon: HeartPulse,
    statusTag: "Verified Outcomes",
  },
  {
    metric: "4.9 ★",
    metricLabel: "Patient Rating",
    subLabel: "From 12,000+ verified reviews",
    icon: Star,
    statusTag: "Top Rated",
  },
];

export default function StatsSection() {
  return (
    <section id="clinical-standards" className="py-16 sm:py-24 bg-background border-b border-border/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-tint-primary-bg px-3 py-1 text-xs font-semibold text-tint-primary-text">
            <Sparkles className="size-3.5 text-primary" />
            <span>Clinical Outcomes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Healthcare measured by real outcomes.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Quantifiable performance across thousands of consultations, audited for clinical excellence and patient safety.
          </p>
        </div>

        {/* 4 Bold Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinicalMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-tint-primary-bg text-primary border border-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border border-border/60">
                      {item.statusTag}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {item.metric}
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {item.metricLabel}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {item.subLabel}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 text-[11px] font-semibold text-secondary flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-secondary" />
                  <span>Audited Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Institutional Accreditation Bar */}
        <div className="mt-10 rounded-2xl border border-border/80 bg-surface/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-text-secondary font-medium text-center sm:text-left">
            <span className="flex size-2 rounded-full bg-secondary shrink-0" />
            <span>Strict compliance with national telemedicine regulations and international privacy laws.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
              <ShieldCheck className="size-3.5 text-secondary" />
              BMDC Listed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
              <Lock className="size-3.5 text-primary" />
              HIPAA & 256-Bit
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
              <FileCheck2 className="size-3.5 text-accent" />
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

