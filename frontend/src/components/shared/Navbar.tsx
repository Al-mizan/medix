"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, Menu, LayoutDashboard, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import type { UserInfo } from "@/types/user.types";

interface NavbarProps {
  user?: UserInfo | null;
}

const navLinks = [
  { label: "Specialties", href: "/#specialties" },
  { label: "Top Specialists", href: "/#top-doctors" },
  { label: "How It Works", href: "/#care-continuum" },
  { label: "Clinical Standards", href: "/#clinical-standards" },
  { label: "All Consultations", href: "/consultation" },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardRoute = user?.role ? getDefaultDashboardRoute(user.role) : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface/85 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
        >
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Activity className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Medix<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-text-secondary"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? "text-primary font-semibold bg-tint-primary-bg/50" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 font-semibold border-border hover:bg-muted text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Link href={dashboardRoute}>
                <LayoutDashboard className="size-4 text-primary" />
                <span>Dashboard</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-sm font-semibold text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold px-4 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Link href="/consultation" className="flex items-center gap-1.5">
              <span>Book Appointment</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open clinical navigation menu"
                className="size-11 min-h-[44px] min-w-[44px] border-border"
              >
                <Menu className="size-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm p-0 flex flex-col h-full bg-surface">
              {/* Drawer Accessible Header */}
              <SheetHeader className="p-5 border-b border-border/70 text-left">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold tracking-tight text-foreground leading-none">
                      Medix<span className="text-primary">.</span>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mt-0.5">
                      Clinical Healthcare
                    </div>
                  </div>
                </SheetTitle>
                <SheetDescription className="text-xs text-text-muted pt-1">
                  Clinical navigation and patient portal access
                </SheetDescription>
              </SheetHeader>

              {/* Scrollable Center Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Mobile Navigation Links */}
                <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1.5">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href === "/consultation" && pathname?.startsWith("/consultation"));
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between text-sm font-medium px-3.5 py-3 rounded-lg transition-colors min-h-[44px] ${
                          isActive
                            ? "bg-tint-primary-bg text-primary font-bold"
                            : "text-foreground hover:text-primary hover:bg-muted/60"
                        }`}
                      >
                        <span>{link.label}</span>
                        <ArrowRight className={`size-4 ${isActive ? "text-primary" : "text-text-muted"}`} />
                      </Link>
                    );
                  })}
                </nav>

                {/* 24/7 Hotline Strip for Mobile */}
                <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <PhoneCall className="size-3.5 text-secondary" />
                    <span>24/7 Clinical Hotline</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Immediate triage assistance & doctor routing
                  </p>
                  <a
                    href="tel:+8801700000000"
                    className="block text-sm font-bold text-primary hover:underline pt-0.5"
                  >
                    +880 1700-000000
                  </a>
                </div>
              </div>

              {/* Mobile Action Buttons with Safe-Area Padding */}
              <div className="p-5 border-t border-border bg-surface flex flex-col gap-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
                {user ? (
                  <Button asChild variant="outline" className="w-full gap-2 h-11 min-h-[44px]">
                    <Link href={dashboardRoute} onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="size-4 text-primary" />
                      <span>My Health Dashboard</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full h-11 min-h-[44px]">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent-hover h-11 min-h-[44px] font-semibold"
                >
                  <Link href="/consultation" onClick={() => setMobileMenuOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
