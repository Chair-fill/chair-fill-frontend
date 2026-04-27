import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { BookingEntity } from '@/lib/api/bookings';

/** GET /calendar/me query params. Either technician_id or shop_id is required. */
export type GetCalendarParams = {
  // Base params if any
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

export interface CalendarBookingTime {
  time: [number, number];
  booking_id: string;
}

export interface CalendarBookingSummary {
  times: CalendarBookingTime[];
  last_updated: string;
  no_of_bookings: number;
}

export interface CalendarDailyAvailability {
  evening: boolean;
  morning: boolean;
  afternoon: boolean;
  off_times: [number, number][]; // [start_min, end_min]
  open_time: string; // HH:mm
  close_time: string; // HH:mm
}

export interface CalendarDailyEntry {
  bookings: CalendarBookingSummary[];
  open_time: string;
  close_time: string;
  availability: CalendarDailyAvailability;
  total_bookings: number;
  availability_modified: boolean;
  total_cancelled_bookings: number;
}

/** Calendar response — bookings grouped by day plus period summaries. */
export interface CalendarResponse {
  id: string;
  total_bookings: number;
  total_cancelled_bookings: number;
  daily_entries: Record<string, CalendarDailyEntry>;
  monthly_entries: Record<string, {
    total_bookings: number;
    total_cancelled_bookings: number;
  }>;
  yearly_entries: Record<string, {
    total_bookings: number;
    total_cancelled_bookings: number;
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
    
    const result = (raw?.data ?? raw) as CalendarResponse;
    if (!result || typeof result !== 'object') {
       throw new Error('Invalid calendar response received');
    }
    return result;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Get public calendar for a technician. GET /calendar/me?technician_id=... (No JWT required on backend)
 */
export async function getPublicCalendar(id: string): Promise<CalendarResponse> {
  return getCalendar({ technician_id: id });
}
