import { Toaster } from "@/components/ui/sonner";
import QueryProviders from "@/providers/QueryProvider";
import CookieConsentBanner from "@/components/shared/CookieConsentBanner";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medix.health";

export const viewport: Viewport = {
    themeColor: "#0B7285",
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Medix - Modern Digital Healthcare & Telemedicine",
        template: "%s | Medix",
    },
    description:
        "Connect with verified medical specialists, book video or in-clinic consultations, manage electronic health records, and experience intelligent clinical assistance.",
    keywords: [
        "telemedicine",
        "digital healthcare",
        "doctor appointments",
        "electronic health records",
        "online doctor consultation",
        "clinical care",
        "Medix",
    ],
    authors: [{ name: "Medix Healthcare Technologies" }],
    creator: "Medix Healthcare Technologies",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        shortcut: "/icon.svg",
        apple: "/icon.svg",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "Medix Healthcare",
        title: "Medix - Modern Digital Healthcare & Telemedicine",
        description:
            "Connect with board-certified physicians, schedule video consultations in seconds, and access unified electronic health records.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Medix - Modern Digital Healthcare & Telemedicine",
        description:
            "Connect with board-certified physicians, schedule video consultations in seconds, and access unified electronic health records.",
        creator: "@medixhealth",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <QueryProviders>
                    {children}
                    <Toaster position="top-right" richColors />
                    <CookieConsentBanner />
                    <GoogleAnalytics />
                </QueryProviders>
            </body>
        </html>
    );
}

