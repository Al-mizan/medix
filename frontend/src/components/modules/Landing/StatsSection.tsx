import {
  UserCheck,
  Users,
  Stethoscope,
  CalendarCheck2,
  TrendingUp,
} from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const stats: StatItem[] = [
  {
    label: "Total Doctors",
    value: "50+",
    subtext: "Board-certified & vetted",
    icon: UserCheck,
  },
  {
    label: "Patients Served",
    value: "10,000+",
    subtext: "Across major healthcare centers",
    icon: Users,
  },
  {
    label: "Medical Specialties",
    value: "25+",
    subtext: "From cardiology to pediatrics",
    icon: Stethoscope,
  },
  {
    label: "Appointments Completed",
    value: "15,000+",
    subtext: "With 99.8% positive feedback",
    icon: CalendarCheck2,
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-[#095E70] to-[#075463] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Subtle geometric pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Heading badge */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-white/15 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-xs mb-3">
                <TrendingUp className="size-3.5" />
                <span>Proven Health Outcomes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Clinical Impact at Scale
              </h2>
            </div>
            <p className="text-sm text-white/80 max-w-md">
              Delivering rapid triage, reduced waiting times, and continuous post-consultation
              care across the healthcare continuum.
            </p>
          </div>

          {/* Stat counters grid */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 sm:p-6 backdrop-blur-xs border border-white/10 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center text-white mb-4">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-white/95 mt-1">
                      {stat.label}
                    </div>
                    <p className="text-xs text-white/70 mt-1">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
