"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import type { UserInfo } from "@/types/user.types";

interface NavbarProps {
  user?: UserInfo | null;
}

const navLinks = [
  { label: "Specialties", href: "/#specialties" },
  { label: "Top Doctors", href: "/#top-doctors" },
  { label: "Why Medix", href: "/#why-choose" },
  { label: "Consultations", href: "/consultation" },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardRoute = user?.role ? getDefaultDashboardRoute(user.role) : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Medix<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors hover:text-primary ${
                  isActive ? "text-primary font-semibold" : ""
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
              className="gap-1.5 font-medium"
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
              className="text-sm font-medium text-foreground hover:bg-muted"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent-hover font-medium shadow-sm transition-all"
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
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Activity className="size-4" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Medix<span className="text-primary">.</span>
                  </span>
                </div>

                <nav className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-border flex flex-col gap-3">
                {user ? (
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href={dashboardRoute} onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="size-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent-hover">
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
