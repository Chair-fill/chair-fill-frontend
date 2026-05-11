/**
 * Marketplace data layer.
 * Swap these functions for real API calls when the backend is ready.
 * All data-access goes through these 4 functions — nothing else imports raw CITIES/SHOPS.
 */

export interface BoothPlan {
  name: string;
  price: number | null; // null = hidePricing
  period: "week" | "month";
  description: string;
}

export interface Shop {
  slug: string;
  city: string;           // matches CITIES key
  state: string;
  name: string;
  address: string;
  phone: string | null;
  claimed: boolean;
  description: string;
  amenities: string[];
  gallery: string[];      // placeholder image URLs
  boothPlans: BoothPlan[];
  hidePricing: boolean;
  lat: number;
  lng: number;
}

export interface City {
  slug: string;
  name: string;
  state: string;
  headline: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────

export const CITIES: City[] = [
  { slug: "tampa-fl",        name: "Tampa",         state: "FL", headline: "Find barber booth rentals in Tampa, FL" },
  { slug: "miami-fl",        name: "Miami",         state: "FL", headline: "Find barber booth rentals in Miami, FL" },
  { slug: "orlando-fl",      name: "Orlando",       state: "FL", headline: "Find barber booth rentals in Orlando, FL" },
  { slug: "atlanta-ga",      name: "Atlanta",       state: "GA", headline: "Find barber booth rentals in Atlanta, GA" },
  { slug: "houston-tx",      name: "Houston",       state: "TX", headline: "Find barber booth rentals in Houston, TX" },
  { slug: "dallas-tx",       name: "Dallas",        state: "TX", headline: "Find barber booth rentals in Dallas, TX" },
  { slug: "charlotte-nc",    name: "Charlotte",     state: "NC", headline: "Find barber booth rentals in Charlotte, NC" },
  { slug: "los-angeles-ca",  name: "Los Angeles",   state: "CA", headline: "Find barber booth rentals in Los Angeles, CA" },
  { slug: "chicago-il",      name: "Chicago",       state: "IL", headline: "Find barber booth rentals in Chicago, IL" },
  { slug: "new-york-ny",     name: "New York",      state: "NY", headline: "Find barber booth rentals in New York, NY" },
];

export const SHOPS: Shop[] = [
  // Tampa
  {
    slug: "kings-cuts-tampa",
    city: "tampa-fl", state: "FL",
    name: "King's Cuts",
    address: "1842 N Armenia Ave, Tampa, FL 33607",
    phone: "(813) 555-0101",
    claimed: true,
    description: "Premium barbershop in West Tampa with 6 booths available for experienced stylists. Walk-in friendly, strong loyal client base.",
    amenities: ["Free WiFi", "Parking", "AC", "Music System", "Shampoo Bowl"],
    gallery: [],
    boothPlans: [
      { name: "Part-Time", price: 150, period: "week", description: "3 days/week, flexible scheduling" },
      { name: "Full-Time", price: 250, period: "week", description: "5 days/week, your own booth" },
    ],
    hidePricing: false,
    lat: 27.9626, lng: -82.4796,
  },
  {
    slug: "prestige-barbershop-tampa",
    city: "tampa-fl", state: "FL",
    name: "Prestige Barbershop",
    address: "4211 W Kennedy Blvd, Tampa, FL 33609",
    phone: "(813) 555-0187",
    claimed: false,
    description: "Established barbershop near Hyde Park. High foot traffic location, 4 available chairs.",
    amenities: ["Parking", "AC", "Point of Sale"],
    gallery: [],
    boothPlans: [
      { name: "Standard Booth", price: null, period: "week", description: "Contact owner for pricing" },
    ],
    hidePricing: true,
    lat: 27.9470, lng: -82.4930,
  },
  // Miami
  {
    slug: "south-beach-fades-miami",
    city: "miami-fl", state: "FL",
    name: "South Beach Fades",
    address: "737 Washington Ave, Miami Beach, FL 33139",
    phone: "(305) 555-0144",
    claimed: true,
    description: "High-energy South Beach shop with international clientele. Booths available 7 days.",
    amenities: ["Free WiFi", "AC", "Music System", "Shampoo Bowl", "Product Display"],
    gallery: [],
    boothPlans: [
      { name: "Weekly", price: 300, period: "week", description: "Full access, 7 days" },
      { name: "Monthly", price: 1000, period: "month", description: "Discounted rate, monthly commitment" },
    ],
    hidePricing: false,
    lat: 25.7817, lng: -80.1300,
  },
  // Atlanta
  {
    slug: "atl-fresh-cuts-atlanta",
    city: "atlanta-ga", state: "GA",
    name: "ATL Fresh Cuts",
    address: "285 Peachtree Center Ave, Atlanta, GA 30303",
    phone: "(404) 555-0199",
    claimed: true,
    description: "Downtown Atlanta barbershop with strong weekday professional clientele. 3 booths open.",
    amenities: ["Free WiFi", "Parking Nearby", "AC", "Shampoo Bowl"],
    gallery: [],
    boothPlans: [
      { name: "Full-Time Booth", price: 200, period: "week", description: "Your chair, your schedule" },
    ],
    hidePricing: false,
    lat: 33.7590, lng: -84.3880,
  },
  // Houston
  {
    slug: "houston-edge-up-houston",
    city: "houston-tx", state: "TX",
    name: "Houston Edge Up",
    address: "5800 Westheimer Rd, Houston, TX 77057",
    phone: "(713) 555-0122",
    claimed: false,
    description: "Busy Galleria-area shop with 8 total chairs, 2 available for booth renters.",
    amenities: ["Parking", "AC", "Point of Sale"],
    gallery: [],
    boothPlans: [
      { name: "Booth Rental", price: null, period: "week", description: "Call for current availability" },
    ],
    hidePricing: true,
    lat: 29.7394, lng: -95.4717,
  },
  // Dallas
  {
    slug: "uptown-cuts-dallas",
    city: "dallas-tx", state: "TX",
    name: "Uptown Cuts",
    address: "2401 McKinney Ave, Dallas, TX 75201",
    phone: "(214) 555-0133",
    claimed: true,
    description: "Uptown Dallas shop catering to young professionals. 2 booths available immediately.",
    amenities: ["Free WiFi", "Parking", "AC", "Music System"],
    gallery: [],
    boothPlans: [
      { name: "Part-Time", price: 125, period: "week", description: "Tue–Thu + Sat" },
      { name: "Full-Time", price: 225, period: "week", description: "Mon–Sat" },
    ],
    hidePricing: false,
    lat: 32.7975, lng: -96.8018,
  },
  // Charlotte
  {
    slug: "queen-city-cuts-charlotte",
    city: "charlotte-nc", state: "NC",
    name: "Queen City Cuts",
    address: "210 E Trade St, Charlotte, NC 28202",
    phone: "(704) 555-0166",
    claimed: true,
    description: "Uptown Charlotte shop with growing client base. Ideal for barbers looking to build their book.",
    amenities: ["Free WiFi", "AC", "Shampoo Bowl", "Product Display"],
    gallery: [],
    boothPlans: [
      { name: "Standard", price: 175, period: "week", description: "5 days/week" },
    ],
    hidePricing: false,
    lat: 35.2271, lng: -80.8431,
  },
  // Los Angeles
  {
    slug: "la-fades-los-angeles",
    city: "los-angeles-ca", state: "CA",
    name: "LA Fades",
    address: "8500 Beverly Blvd, Los Angeles, CA 90048",
    phone: "(323) 555-0177",
    claimed: false,
    description: "Beverly Hills adjacent shop with celebrity clientele. High-end booths available.",
    amenities: ["Valet Parking", "AC", "Music System", "Shampoo Bowl"],
    gallery: [],
    boothPlans: [
      { name: "Premium Booth", price: null, period: "week", description: "Inquire for pricing" },
    ],
    hidePricing: true,
    lat: 34.0736, lng: -118.3784,
  },
  // Chicago
  {
    slug: "chi-town-cuts-chicago",
    city: "chicago-il", state: "IL",
    name: "Chi Town Cuts",
    address: "33 W Monroe St, Chicago, IL 60603",
    phone: "(312) 555-0188",
    claimed: true,
    description: "Loop-area barbershop serving downtown Chicago professionals. 3 booths available.",
    amenities: ["Free WiFi", "Parking Nearby", "AC", "Point of Sale"],
    gallery: [],
    boothPlans: [
      { name: "Weekday", price: 160, period: "week", description: "Mon–Fri only" },
      { name: "Full Week", price: 220, period: "week", description: "Mon–Sat" },
    ],
    hidePricing: false,
    lat: 41.8808, lng: -87.6298,
  },
  // New York
  {
    slug: "empire-cuts-new-york",
    city: "new-york-ny", state: "NY",
    name: "Empire Cuts",
    address: "350 W 42nd St, New York, NY 10036",
    phone: "(212) 555-0199",
    claimed: true,
    description: "Midtown Manhattan shop with heavy foot traffic. Premium chairs in a professional environment.",
    amenities: ["Free WiFi", "AC", "Music System", "Shampoo Bowl", "Product Display"],
    gallery: [],
    boothPlans: [
      { name: "Part-Time", price: 350, period: "week", description: "3 days/week" },
      { name: "Full-Time", price: 550, period: "week", description: "5 days/week" },
    ],
    hidePricing: false,
    lat: 40.7580, lng: -73.9930,
  },
  // Orlando
  {
    slug: "orlando-fresh-cuts-orlando",
    city: "orlando-fl", state: "FL",
    name: "Orlando Fresh Cuts",
    address: "100 S Orange Ave, Orlando, FL 32801",
    phone: "(407) 555-0155",
    claimed: false,
    description: "Downtown Orlando shop near the tourism corridor. Strong weekend traffic.",
    amenities: ["Parking", "AC"],
    gallery: [],
    boothPlans: [
      { name: "Booth Rental", price: null, period: "week", description: "Call to discuss" },
    ],
    hidePricing: true,
    lat: 28.5383, lng: -81.3792,
  },
];

// ── Data access functions ──────────────────────────────────────────────────
// Swap these for API calls (e.g. api.get('/marketplace/cities/:slug')) when ready.

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getShop(citySlug: string, shopSlug: string): Shop | undefined {
  return SHOPS.find((s) => s.city === citySlug && s.slug === shopSlug);
}

export function getShopsByCity(citySlug: string): Shop[] {
  return SHOPS.filter((s) => s.city === citySlug);
}

export function countLookingBarbersForCity(_citySlug: string): number {
  // TODO: replace with GET /marketplace/barbers/looking?city=citySlug count
  return Math.floor(Math.random() * 8) + 2; // seed: 2–9
}
