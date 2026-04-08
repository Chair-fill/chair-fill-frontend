import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { BookingEntity } from '@/lib/api/bookings';

/** GET /calendar/me query params (one of technician_id / shop_id required). */
export interface GetCalendarParams {
  technician_id?: string;
  shop_id?: string;
}

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
    const query = search.toString();
    const url = query ? `${API.CALENDAR.ME}?${query}` : API.CALENDAR.ME;
    const { data } = await api.get<unknown>(url);
    const raw = data as { data?: CalendarResponse } & CalendarResponse;
    return (raw?.data ?? raw) as CalendarResponse;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
