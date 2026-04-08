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

/** Create offering body (POST /offerings). */
export interface CreateOfferingBody {
  name: string;
  price: number;
  duration: number;
  description?: string;
  technician_id: string;
  shop_id?: string;
  premium_hours?: { slots: { from: string; to: string; price?: number }[] };
  promo?: {
    discount: number;
    enabled: boolean;
    expiry: string;
    price?: number;
    from?: string;
    to?: string;
  };
}

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

/** List query params. */
export interface ListOfferingsParams {
  technician_id?: string;
  shop_id?: string;
  search?: string;
  cursor?: string;
  from?: string;
  to?: string;
  page_size?: number;
}

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
    const inner = (data as { data?: unknown }).data;
    if (inner && typeof inner === 'object') return inner as Offering;
  }
  return data as Offering;
}

/**
 * List offerings. GET /offerings/list?technician_id=...
 */
export async function listOfferings(params: ListOfferingsParams): Promise<Offering[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.technician_id) searchParams.set('technician_id', params.technician_id);
    if (params.shop_id) searchParams.set('shop_id', params.shop_id);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    if (params.page_size != null) searchParams.set('page_size', String(params.page_size));
    const query = searchParams.toString();
    const url = query ? `${API.OFFERINGS.LIST}?${query}` : API.OFFERINGS.LIST;
    const { data } = await api.get<unknown>(url);
    return normalizeListResponse(data);
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
      description: body.description ?? '',
      technician_id: body.technician_id,
      premium_hours: body.premium_hours ?? { slots: [] },
    };
    if (body.shop_id) payload.shop_id = body.shop_id;
    if (body.promo) payload.promo = body.promo;
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
