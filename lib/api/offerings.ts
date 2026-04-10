import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getApiErrorMessage } from '@/lib/api-client';

/** API offering (from list or get). Backend returns price as a decimal string (e.g. "20.00"). */
export interface Offering {
  id: string;
  name: string;
  /** Decimal string from backend (e.g. "20.00") — also accepts number for safety. */
  price: string | number;
  duration: number;
  description?: string;
  technician_id?: string;
  shop_id?: string;
  premium_hours?: { slots?: { from: string; to: string; price?: string | number }[] } | null;
  promo?: {
    discount?: number;
    enabled?: boolean;
    expiry?: string;
    price?: string | number;
    from?: string;
    to?: string;
  } | null;
  promo_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Create offering body (POST /offerings). Either technician_id or shop_id is required. */
export type CreateOfferingBody = {
  name: string;
  price: number;
  duration: number;
  description?: string;
  premium_hours?: { slots: { from: string; to: string; price?: number }[] };
  promo?: {
    discount: number;
    enabled: boolean;
    expiry: string;
    price?: number;
    from?: string;
    to?: string;
  };
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

/** Update offering body (PUT /offerings). */
export interface UpdateOfferingBody {
  offering_id: string;
  name?: string;
  price?: number;
  duration?: number;
  description?: string;
  promo_enabled?: boolean;
  promo?: {
    discount: number;
    enabled: boolean;
    expiry: string;
    price?: number;
    from?: string;
    to?: string;
  };
  premium_hours?: { slots: { from: string; to: string; price?: number }[] };
}

/** List query params. Either technician_id or shop_id is required. */
export type ListOfferingsParams = {
  search?: string;
  cursor?: string;
  from?: string;
  to?: string;
  page_size?: number;
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

/** List response - assume array or { data: array }. */
function normalizeListResponse(data: unknown): Offering[] {
  if (Array.isArray(data)) return data as Offering[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Offering[] }).data;
  }
  return [];
}

/** Unwrap { statusCode, status, data: T, message } envelope returned by single-resource endpoints. */
function unwrapResource(data: unknown): Offering {
  if (data && typeof data === 'object') {
    const raw = data as { data?: unknown; offering?: unknown; service?: unknown };
    const inner = raw.data ?? raw.offering ?? raw.service;
    if (inner && typeof inner === 'object') return inner as Offering;
  }
  return data as Offering;
}

/**
 * List offerings. GET /offerings/list?technician_id=... or ?shop_id=...
 */
export async function listOfferings(params: ListOfferingsParams): Promise<Offering[]> {
  const { technician_id, shop_id, search, cursor, from, to, page_size } = params;
  
  if (!technician_id && !shop_id) {
    throw new Error('Either technician_id or shop_id is required to list offerings.');
  }

  try {
    const searchParams = new URLSearchParams();
    if (technician_id) searchParams.set('technician_id', technician_id);
    if (shop_id) searchParams.set('shop_id', shop_id);
    if (search) searchParams.set('search', search);
    if (cursor) searchParams.set('cursor', cursor);
    if (from) searchParams.set('from', from);
    if (to) searchParams.set('to', to);
    if (page_size != null) searchParams.set('page_size', String(page_size));
    
    const query = searchParams.toString();
    const url = query ? `${API.OFFERINGS.LIST}?${query}` : API.OFFERINGS.LIST;
    
    // Use headers for cache busting to avoid breaking the backend's strict URL validation
    const { data } = await api.get<unknown>(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    const normalized = normalizeListResponse(data);
    console.log(`[API] listOfferings result for ${technician_id || shop_id}:`, normalized);
    return normalized;
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Create offering. POST /offerings
 */
export async function createOffering(body: CreateOfferingBody): Promise<Offering> {
  try {
    const payload: Record<string, unknown> = {
      name: body.name,
      price: body.price,
      duration: body.duration,
    };
    
    if (body.description != null) payload.description = body.description;
    if (body.premium_hours) payload.premium_hours = body.premium_hours;
    if (body.technician_id) payload.technician_id = body.technician_id;
    if (body.shop_id) payload.shop_id = body.shop_id;
    if (body.promo) payload.promo = body.promo;
    
    // The offerings backend expects a flat request body, not wrapped in 'data'.
    const { data } = await api.post<unknown>(API.OFFERINGS.CREATE, payload);
    return unwrapResource(data);
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Update offering. PUT /offerings
 */
export async function updateOffering(body: UpdateOfferingBody): Promise<Offering> {
  try {
    // The offerings backend expects a flat request body, not wrapped in 'data'.
    const { data } = await api.put<unknown>(API.OFFERINGS.UPDATE, body);
    return unwrapResource(data);
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}

/**
 * Delete offering. DELETE /offerings/:offeringId
 */
export async function deleteOffering(offeringId: string): Promise<void> {
  try {
    await api.delete(API.OFFERINGS.DELETE(offeringId));
  } catch (err) {
    const message = getApiErrorMessage(err);
    throw new Error(message);
  }
}
