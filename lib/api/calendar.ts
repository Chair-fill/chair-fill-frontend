import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { BookingEntity } from '@/lib/api/bookings';

/** GET /calendar/me query params. Either technician_id or shop_id is required. */
export type GetCalendarParams = {
  // Base params if any
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

/** Calendar response — bookings grouped/listed plus optional metadata. */
export interface CalendarResponse {
  bookings?: BookingEntity[];
  days?: Array<{
    date: string;
    bookings: BookingEntity[];
  }>;
  [key: string]: unknown;
}

/**
 * Get calendar for current user. GET /calendar/me?technician_id=... (JWT)
 */
export async function getCalendar(params: GetCalendarParams): Promise<CalendarResponse> {
  try {
    const search = new URLSearchParams();
    if (params.technician_id) search.set('technician_id', params.technician_id);
    if (params.shop_id) search.set('shop_id', params.shop_id);
    
    if (!params.technician_id && !params.shop_id) {
      throw new Error('Either technician_id or shop_id is required to get calendar.');
    }

    const query = search.toString();
    const url = query ? `${API.CALENDAR.ME}?${query}` : API.CALENDAR.ME;
    const { data } = await api.get<unknown>(url);
    const raw = data as { data?: CalendarResponse } & CalendarResponse;
    return (raw?.data ?? raw) as CalendarResponse;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
