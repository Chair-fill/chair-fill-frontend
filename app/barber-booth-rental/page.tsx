import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/marketplace/data";
import MarketplaceNav from "@/app/components/ui/marketplace/MarketplaceNav";
import MarketplaceFooter from "@/app/components/ui/marketplace/MarketplaceFooter";

export const metadata: Metadata = {
  title: "Barber Booth Rental — Find Available Chairs Near You | ChairFill",
  description:
    "Browse barber booth rentals in Tampa, Miami, Atlanta, Houston, New York, and more. Find your next chair from shops with available booths today.",
  alternates: { canonical: "https://chairfill.co/barber-booth-rental" },
  openGraph: {
    title: "Barber Booth Rental — ChairFill",
    description: "Find available barber booths and chairs for rent near you.",
    type: "website",
  },
};

export default function BoothRentalDirectoryPage() {
  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary mb-4">
            Barber Booth Rental Directory
          </p>
          <h1 className="font-black text-[clamp(36px,7vw,64px)] leading-[0.92] tracking-tight mb-5">
            Find your next chair.
            <span className="block text-primary">Start building your book.</span>
          </h1>
          <p className="text-[16px] text-foreground/60 max-w-[520px] mx-auto leading-relaxed mb-8">
            Browse available barber booth rentals from shops across the country. Filter by city, compare plans, and inquire directly.
          </p>
          <Link
            href="/barbers/looking"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-[14px] font-semibold hover:border-primary/40 hover:text-primary transition-all"
          >
            I&apos;m looking for a chair →
          </Link>
        </section>

        {/* City grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-5">
            Browse by city
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/barber-booth-rental/${city.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[16px] text-foreground group-hover:text-primary transition-colors">
                      {city.name}, {city.state}
                    </p>
                    <p className="text-[13px] text-foreground/50 mt-1">
                      Barber booth rentals available
                    </p>
                  </div>
                  <span className="text-foreground/30 group-hover:text-primary transition-colors text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Own a shop CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
              Shop owners
            </p>
            <h2 className="font-black text-[28px] leading-tight mb-3">
              Have an available booth?
            </h2>
            <p className="text-[14px] text-foreground/60 max-w-[400px] mx-auto mb-6">
              Claim your shop listing for free and start receiving inquiries from barbers in your city.
            </p>
            <Link
              href="/claim"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all"
            >
              Claim your shop free →
            </Link>
          </div>
        </section>
      </main>
      <MarketplaceFooter />
    </>
  );
}
