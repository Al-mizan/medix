import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medix.health";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/consultation`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/diagnostics`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/health-plans`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/medicine`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ngos`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/forgot-password`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/reset-password`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/verify-email`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/thank-you`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  if (!apiBaseUrl) {
    return staticRoutes;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/doctors?limit=200&fields=id,updatedAt`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return staticRoutes;
    }

    const json = await res.json();
    const rawList = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.data?.data)
      ? json.data.data
      : Array.isArray(json)
      ? json
      : [];

    const doctorRoutes: MetadataRoute.Sitemap = rawList
      .filter((doc: unknown): doc is { id: string; updatedAt?: string } => 
        typeof doc === "object" && doc !== null && "id" in doc && typeof (doc as { id: unknown }).id === "string"
      )
      .map((doc: { id: string; updatedAt?: string }) => ({
        url: `${siteUrl}/consultation/doctor/${doc.id}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...doctorRoutes];
  } catch (error) {
    // Non-blocking fallback if backend is offline during build
    console.warn("Dynamic doctor sitemap fetch skipped:", error);
    return staticRoutes;
  }
}
