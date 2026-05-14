import { notFound } from "next/navigation";
import { SHOPS, getShop, getCity } from "@/lib/marketplace/data";
import ShopPageClient from "./ShopPageClient";

interface Props {
  params: Promise<{ city: string; shop: string }>;
}

export default async function ShopPage({ params }: Props) {
  const { city: citySlug, shop: shopSlug } = await params;
  const shop = getShop(citySlug, shopSlug);
  const city = getCity(citySlug);

  if (!shop || !city) notFound();

  return (
    <ShopPageClient 
      shop={shop} 
      city={city} 
      citySlug={citySlug} 
      shopSlug={shopSlug} 
    />
  );
}

// Static params for prerendering
export async function generateStaticParams() {
  return SHOPS.map((s) => ({ city: s.city, shop: s.slug }));
}
