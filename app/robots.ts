import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/barber-booth-rental", "/shops", "/claim", "/barbers", "/inquiries"],
        disallow: [
          "/api/",
          "/onboarding",
          "/dashboard",
          "/contacts",
          "/bookings",
          "/wallet",
          "/subscription",
          "/profile",
          "/services",
          "/complete-registration",
        ],
      },
    ],
    sitemap: "https://chairfill.co/sitemap.xml",
  };
}
