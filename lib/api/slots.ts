import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

/** A bookable slot/seat for a technician or shop. */
export interface Slot {
  id: string;
  name: string;
  index?: number;
  color?: string;
  class?: string;
  features?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/** GET /slots/me query params. Either technician_id or shop_id is required. */
export type GetSlotsParams = {
  // Base params if any
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

function normalizeListResponse(data: unknown): Slot[] {
  if (Array.isArray(data)) return data as Slot[];
  if (data && typeof data === 'object') {
    const inner = (data as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as Slot[];
    if (inner && typeof inner === 'object' && Array.isArray((inner as { slots?: unknown }).slots)) {
      return (inner as { slots: Slot[] }).slots;
    }
    if (Array.isArray((data as { slots?: unknown }).slots)) {
      return (data as { slots: Slot[] }).slots;
    }
  }
  return [];
}

/**
 * Get slots for current user (technician or shop). GET /slots/me?technician_id=...
 * Provide exactly one of technician_id / shop_id (mutually exclusive).
 */
export async function getSlots(params: GetSlotsParams): Promise<Slot[]> {
  try {
    const search = new URLSearchParams();
    if (params.technician_id) search.set('technician_id', params.technician_id);
    if (params.shop_id) search.set('shop_id', params.shop_id);
    
    if (!params.technician_id && !params.shop_id) {
      throw new Error('Either technician_id or shop_id is required to get slots.');
    }

    const query = search.toString();
    const url = query ? `${API.SLOTS.ME}?${query}` : API.SLOTS.ME;
    const { data } = await api.get<unknown>(url);
    return normalizeListResponse(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
