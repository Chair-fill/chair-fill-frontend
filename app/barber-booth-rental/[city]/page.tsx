import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CITIES,
  getCity,
  getShopsByCity,
  countLookingBarbersForCity,
} from "@/lib/marketplace/data";
import MarketplaceNav from "@/app/components/marketplace/MarketplaceNav";
import MarketplaceFooter from "@/app/components/marketplace/MarketplaceFooter";
import ChairFillCTA from "@/app/components/marketplace/ChairFillCTA";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);
  if (!city) return {};
  const title = `Barber Booth Rental in ${city.name}, ${city.state} | ChairFill`;
  const description = `Find available barber booths and chairs for rent in ${city.name}, ${city.state}. Compare plans, amenities, and inquire directly with shop owners.`;
  return {
    title,
    description,
    alternates: { canonical: `https://chairfill.co/barber-booth-rental/${city.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);
  if (!city) notFound();

  const shops = getShopsByCity(citySlug);
  const lookingCount = countLookingBarbersForCity(citySlug);

  // JSON-LD breadcrumb
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Booth Rental", item: "https://chairfill.co/barber-booth-rental" },
      { "@type": "ListItem", position: 2, name: `${city.name}, ${city.state}`, item: `https://chairfill.co/barber-booth-rental/${city.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-foreground/40 mb-8 font-mono">
            <Link href="/barber-booth-rental" className="hover:text-primary transition-colors">
              Booth Rental
            </Link>
            <span>/</span>
            <span className="text-foreground/70">{city.name}, {city.state}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-black text-[clamp(28px,5vw,48px)] leading-tight mb-3">
              {city.headline}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-foreground/50">
              <span>{shops.length} shop{shops.length !== 1 ? "s" : ""} listed</span>
              <span>·</span>
              <span className="text-green-500 font-medium">{lookingCount} barbers looking in {city.name}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Shop list */}
            <div className="flex-1 space-y-4">
              {shops.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-foreground/50 text-[14px]">No listings yet for {city.name}.</p>
                  <Link href="/claim" className="mt-4 inline-block text-primary text-[13px] hover:underline">
                    Own a shop here? Claim it free →
                  </Link>
                </div>
              ) : (
                shops.map((shop) => (
                  <Link
                    key={shop.slug}
                    href={`/shops/${citySlug}/${shop.slug}`}
                    className="block bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-bold text-[16px] text-foreground group-hover:text-primary transition-colors">
                            {shop.name}
                          </h2>
                          {shop.claimed ? (
                            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                              ✓ Claimed
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-border text-foreground/40">
                              Unclaimed
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-foreground/50 mb-3">{shop.address}</p>
                        <p className="text-[13px] text-foreground/70 line-clamp-2">{shop.description}</p>
                        {shop.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {shop.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="text-[11px] px-2 py-0.5 rounded-full border border-border text-foreground/50">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {shop.hidePricing ? (
                          <p className="text-[13px] text-foreground/40">Contact for pricing</p>
                        ) : shop.boothPlans[0] ? (
                          <>
                            <p className="font-black text-[20px] text-primary">
                              ${shop.boothPlans[0].price}
                            </p>
                            <p className="text-[11px] text-foreground/40">/{shop.boothPlans[0].period}</p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-64 space-y-4 shrink-0">
              {/* Mini demand signal */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-2">
                  Demand signal
                </p>
                <p className="font-black text-[32px] text-green-500 leading-none mb-1">
                  {lookingCount}
                </p>
                <p className="text-[13px] text-foreground/60">
                  barbers actively looking for a chair in {city.name}
                </p>
                <Link
                  href="/barbers/looking"
                  className="mt-3 block text-[12px] text-primary hover:underline"
                >
                  Add your name →
                </Link>
              </div>

              {/* Own a shop? */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="font-bold text-[14px] mb-2">Own a shop in {city.name}?</p>
                <p className="text-[13px] text-foreground/60 mb-3">
                  Claim your listing and start receiving inquiries from barbers for free.
                </p>
                <Link
                  href="/claim"
                  className="block text-center px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-[13px] hover:brightness-110 transition-all"
                >
                  Claim free →
                </Link>
              </div>

              <ChairFillCTA variant="banner" />
            </aside>
          </div>
        </div>
      </main>
      <MarketplaceFooter />
    </>
  );
}
