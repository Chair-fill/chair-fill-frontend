export interface Offering {
  id: string;
  offering_id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  technician_id: string;
  shop_id?: string;
  premium_hours?: boolean;
  promo?: boolean;
}
