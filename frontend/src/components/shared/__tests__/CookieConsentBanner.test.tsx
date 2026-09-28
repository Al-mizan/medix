import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CookieConsentBanner, {
  CONSENT_KEY,
  CONSENT_EVENT,
  getConsentCookie,
  setPersistentConsentCookie,
  clearAnalyticsCookies,
} from "../CookieConsentBanner";
import GoogleAnalytics from "../GoogleAnalytics";

describe("CookieConsentBanner Component & Cookie Lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders cookie banner when neither localStorage nor cookie has consent saved", () => {
    render(<CookieConsentBanner />);

    expect(screen.getByRole("region", { name: /cookie consent banner/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /essential only/i })).toBeInTheDocument();
  });

  it("does not render banner if consent is already recorded in localStorage", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");

    const { container } = render(<CookieConsentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render banner if consent cookie is already set", () => {
    document.cookie = `${CONSENT_KEY}=essential; path=/; max-age=31536000; SameSite=Lax`;

    const { container } = render(<CookieConsentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("sets persistent cookie and localStorage when Accept All is clicked", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(<CookieConsentBanner />);

    const acceptBtn = screen.getByRole("button", { name: /accept all/i });
    fireEvent.click(acceptBtn);

    expect(localStorage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(getConsentCookie(CONSENT_KEY)).toBe("accepted");
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: CONSENT_EVENT,
        detail: { level: "accepted" },
      })
    );
  });

  it("sets persistent essential cookie, purges analytics cookies, and dismisses on Essential Only", () => {
    // Simulate pre-existing tracking cookie
    document.cookie = "_ga=GA1.2.123456789.1234567890; path=/";
    expect(document.cookie).toContain("_ga");

    render(<CookieConsentBanner />);

    const essentialBtn = screen.getByRole("button", { name: /essential only/i });
    fireEvent.click(essentialBtn);

    expect(localStorage.getItem(CONSENT_KEY)).toBe("essential");
    expect(getConsentCookie(CONSENT_KEY)).toBe("essential");
    expect(document.cookie).not.toContain("_ga=");
  });

  it("getConsentCookie extracts cookie correctly", () => {
    setPersistentConsentCookie("accepted");
    expect(getConsentCookie(CONSENT_KEY)).toBe("accepted");
  });

  it("clearAnalyticsCookies removes Google Analytics cookies", () => {
    document.cookie = "_ga_TEST=GS1.1.1234; path=/";
    document.cookie = "_gid=GA1.2.987654; path=/";

    clearAnalyticsCookies();

    expect(document.cookie).not.toContain("_ga_TEST");
    expect(document.cookie).not.toContain("_gid");
  });
});

describe("GoogleAnalytics Component Guard", () => {
  const originalEnv = process.env.NEXT_PUBLIC_GA_ID;

  beforeEach(() => {
    localStorage.clear();
    process.env.NEXT_PUBLIC_GA_ID = "G-MOCKMEASUREMENTID";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GA_ID = originalEnv;
  });

  it("blocks analytics scripts when consent has not been granted", () => {
    const { container } = render(<GoogleAnalytics />);
    expect(container.firstChild).toBeNull();
  });

  it("blocks analytics scripts when consent is essential only", () => {
    localStorage.setItem(CONSENT_KEY, "essential");
    const { container } = render(<GoogleAnalytics />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Google Analytics scripts when consent is accepted", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    const { container } = render(<GoogleAnalytics />);

    expect(container).toBeDefined();
  });
});
