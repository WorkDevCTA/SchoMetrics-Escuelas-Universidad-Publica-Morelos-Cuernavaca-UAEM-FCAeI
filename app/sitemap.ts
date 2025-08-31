// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://uaem-fcaei.schometrics.website",
      lastModified: new Date("2025-08-01T00:00:00Z"),
      changeFrequency: "yearly",
      priority: 1,
    },
  ];
}
