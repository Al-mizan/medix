"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, PhoneCall, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StickyMobileCTA() {
  const pathname = usePathname();

  // Hide sticky CTA on session/video call pages or when user is already booking
  if (pathname?.includes("/consultation/session")) {
    return null;
  }

  return (
    <aside
      aria-label="Mobile quick consultation bar"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-lg px-4 py-2.5 shadow-2xl transition-all"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 gap-2 border-border text-foreground hover:bg-muted font-medium h-10 rounded-xl"
        >
          <a href="tel:+8801700000000" className="flex items-center justify-center gap-1.5 text-xs">
            <PhoneCall className="size-3.5 text-secondary" />
            <span>24/7 Triage</span>
          </a>
        </Button>

        <Button
          asChild
          size="sm"
          className="flex-[1.8] gap-2 bg-accent text-accent-foreground hover:bg-accent-hover font-semibold h-10 rounded-xl shadow-sm"
        >
          <Link href="/consultation" className="flex items-center justify-center gap-2 text-xs">
            {pathname === "/consultation" ? (
              <>
                <Stethoscope className="size-4" />
                <span>Browse Specialists</span>
              </>
            ) : (
              <>
                <Calendar className="size-4" />
                <span>Book Appointment</span>
              </>
            )}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
