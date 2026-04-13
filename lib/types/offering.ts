export interface Offering {
  id: string;
  /** Legacy alias — some code still references this; same as id. */
  offering_id?: string;
  name: string;
  /** May arrive as a decimal string ("20.00") or number from the API. */
  price: number | string;
  duration: number; // in minutes
  description?: string;
  technician_id?: string;
  shop_id?: string;
  premium_hours?: boolean | { slots?: unknown[] } | null;
  promo?: boolean | { enabled?: boolean } | null;
  promo_enabled?: boolean;
}
