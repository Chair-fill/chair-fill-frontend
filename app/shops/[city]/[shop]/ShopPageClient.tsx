"use client";

import Link from "next/link";
import { useState } from "react";
import MarketplaceNav from "@/app/components/ui/marketplace/MarketplaceNav";
import MarketplaceFooter from "@/app/components/ui/marketplace/MarketplaceFooter";
import ChairFillCTA from "@/app/components/ui/marketplace/ChairFillCTA";

interface ShopPageClientProps {
  shop: any;
  city: any;
  citySlug: string;
  shopSlug: string;
}

export default function ShopPageClient({ shop, city, citySlug, shopSlug }: ShopPageClientProps) {
  const [inquirySent, setInquirySent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: shop.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "US",
    },
    telephone: shop.phone ?? undefined,
    geo: { "@type": "GeoCoordinates", latitude: shop.lat, longitude: shop.lng },
    url: `https://chairfill.co/shops/${citySlug}/${shopSlug}`,
  };

  function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /marketplace/inquiries { shopSlug, citySlug, ...form }
    setInquirySent(true);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-foreground/40 mb-8 font-mono flex-wrap">
            <Link href="/barber-booth-rental" className="hover:text-primary transition-colors">Booth Rental</Link>
            <span>/</span>
            <Link href={`/barber-booth-rental/${citySlug}`} className="hover:text-primary transition-colors">
              {city.name}, {city.state}
            </Link>
            <span>/</span>
            <span className="text-foreground/70">{shop.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-black text-[clamp(24px,4vw,40px)] leading-tight">{shop.name}</h1>
                  {shop.claimed ? (
                    <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-500">✓ Claimed listing</span>
                  ) : (
                    <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-border text-foreground/40">Unclaimed</span>
                  )}
                </div>
                <p className="text-[14px] text-foreground/50">{shop.address}</p>
              </div>

              {/* Gallery placeholder */}
              <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`bg-card border border-border flex items-center justify-center text-foreground/20 text-[12px] font-mono ${i === 0 ? "col-span-2 h-48" : "h-48"}`}
                  >
                    {shop.claimed ? "Photo" : "No photos"}
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">About</p>
                <p className="text-[14px] text-foreground/80 leading-relaxed">{shop.description}</p>
              </div>

              {/* Amenities */}
              {shop.amenities.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {shop.amenities.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 rounded-full border border-border text-[13px] text-foreground/70">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booth plans */}
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">Booth Plans</p>
                {shop.hidePricing ? (
                  <p className="text-[14px] text-foreground/60">Pricing available on inquiry — contact the shop directly.</p>
                ) : (
                  <div className="space-y-3">
                    {shop.boothPlans.map((plan: any) => (
                      <div key={plan.name} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-semibold text-[14px]">{plan.name}</p>
                          <p className="text-[13px] text-foreground/50">{plan.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {plan.price ? (
                            <>
                              <p className="font-black text-[20px] text-primary">${plan.price}</p>
                              <p className="text-[11px] text-foreground/40">/{plan.period}</p>
                            </>
                          ) : (
                            <p className="text-[13px] text-foreground/40">Contact for price</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ChairFillCTA variant="banner" />
            </div>

            {/* Side rail */}
            <aside className="lg:w-72 shrink-0 space-y-4">
              {shop.claimed ? (
                /* Inquiry form */
                <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
                  <p className="font-bold text-[16px] mb-1">Inquire about a booth</p>
                  <p className="text-[13px] text-foreground/50 mb-5">Send a message directly to {shop.name}.</p>
                  {inquirySent ? (
                    <div className="text-center py-6">
                      <p className="text-[28px] mb-2">✓</p>
                      <p className="font-semibold text-[14px] text-green-500 mb-1">Inquiry sent!</p>
                      <p className="text-[13px] text-foreground/50">The shop owner will follow up shortly.</p>
                      <Link href="/inquiries" className="mt-4 block text-[13px] text-primary hover:underline">
                        View my inquiries →
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleInquiry} className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Your name</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                          placeholder="Marcus Johnson"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Phone number</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                          placeholder="(813) 555-0100"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-mono tracking-wider text-foreground/50 mb-1.5">Message</label>
                        <textarea
                          required
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                          placeholder="I'm interested in a full-time booth, available starting next week..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all"
                      >
                        Send inquiry
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Unclaimed state */
                <div className="bg-card border border-border rounded-xl p-6 sticky top-20 space-y-4">
                  <div>
                    <p className="font-bold text-[15px] mb-1">This shop hasn&apos;t been claimed yet.</p>
                    <p className="text-[13px] text-foreground/60">
                      Call directly or claim this listing to enable inquiries.
                    </p>
                  </div>
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-border font-semibold text-[14px] hover:border-primary/40 hover:text-primary transition-all"
                    >
                      📞 {shop.phone}
                    </a>
                  )}
                  <div className="border-t border-border pt-4">
                    <p className="text-[13px] font-semibold text-foreground mb-1">Own this shop?</p>
                    <p className="text-[12px] text-foreground/50 mb-3">
                      Claim it free and start receiving inquiries from barbers.
                    </p>
                    <Link
                      href="/claim"
                      className="block text-center py-2.5 rounded-lg bg-primary text-black font-bold text-[13px] hover:brightness-110 transition-all"
                    >
                      Claim it free →
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <MarketplaceFooter />
    </>
  );
}
