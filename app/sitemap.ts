import { MetadataRoute } from "next";
import { CITIES, SHOPS } from "@/lib/marketplace/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chairfill.co";

  const cityPages = CITIES.map((c) => ({
    url: `${base}/barber-booth-rental/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const shopPages = SHOPS.map((s) => ({
    url: `${base}/shops/${s.city}/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${base}/barber-booth-rental`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/claim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/barbers/looking`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...cityPages,
    ...shopPages,
  ];
}
