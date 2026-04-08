import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

/** Service line on a booking request. */
export interface BookingServiceInput {
  /** Offering id (e.g. OFF-...) */
  id: string;
  units: number;
}

/** Client info for the booking. Either fill the fields, or pass an existing contact_id. */
export interface BookingClientInput {
  fullname?: string;
  email?: string;
  phone_number?: string;
  contact_id?: string;
}

/** Optional service location. */
export interface BookingLocationInput {
  street?: string;
  country?: string;
  state?: string;
  lgea?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

/** POST /booking/:eid/book payload (inner data). */
export interface CreateBookingData {
  services: BookingServiceInput[];
  client: BookingClientInput;
  location?: BookingLocationInput;
  /** ISO date string for the booking start time */
  date: string;
  /** Optional slot id (e.g. SLT-...) */
  slot_id?: string;
}

/** Booking entity returned by the API (loose typing — backend shape is rich). */
export interface BookingEntity {
  id: string;
  link?: string;
  start_date: string;
  end_date: string;
  time_zone?: string;
  payment_status?: string;
  type?: string;
  owner_entity_type?: 'technician' | 'shop';
  services_snapshot?: Array<{
    name: string;
    units: number;
    unit_price: number;
    offering_id: string;
    duration_mins: number;
  }>;
  booking_services?: Array<{
    units: number;
    offering_id: string;
    duration_mins: number;
  }>;
  location?: unknown;
  slot?: { id: string; name?: string; index?: number; color?: string; class?: string } | null;
  technician?: Record<string, unknown> | null;
  shop?: Record<string, unknown> | null;
  contact?: Record<string, unknown> | null;
  booker?: Record<string, unknown> | null;
  no_of_times_postponed?: number;
  created_at?: string;
  updated_at?: string;
}

/** Response of POST /booking/:eid/book. */
export interface CreateBookingResponse {
  booking: BookingEntity;
  checkout_session?: {
    id: string;
    url?: string;
    payment_status?: string;
    amount_total?: number;
    currency?: string;
    [key: string]: unknown;
  } | null;
}

/** PUT /booking/:bookingId/update payload (inner data). */
export interface UpdateBookingData {
  date?: string;
  services?: BookingServiceInput[];
  slot_id?: string;
  location?: BookingLocationInput;
}

/** GET /booking/list query params. Use one of technician_id / shop_id. */
export interface ListBookingsParams {
  technician_id?: string;
  shop_id?: string;
  /** YYYY-MM-DD */
  from_date?: string;
  /** YYYY-MM-DD */
  to_date?: string;
  page_size?: number;
  cursor?: string;
}

/** Paginated list result. */
export interface ListBookingsResult {
  bookings: BookingEntity[];
  page_size?: number;
  next_cursor?: string;
}

function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/**
 * Create a booking under an entity (technician or shop).
 * POST /booking/:eid/book  Body: { data: CreateBookingData }
 */
export async function createBooking(
  entityId: string,
  bookingData: CreateBookingData,
): Promise<CreateBookingResponse> {
  try {
    const { data } = await api.post<unknown>(API.BOOKING.BOOK(entityId), { data: bookingData });
    return unwrap<CreateBookingResponse>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Update an existing booking. PUT /booking/:bookingId/update
 */
export async function updateBooking(
  bookingId: string,
  updateData: UpdateBookingData,
): Promise<BookingEntity> {
  try {
    const payload: Record<string, unknown> = {};
    if (updateData.date !== undefined) payload.date = updateData.date;
    if (updateData.services !== undefined) payload.services = updateData.services;
    if (updateData.slot_id !== undefined) payload.slot_id = updateData.slot_id;
    if (updateData.location !== undefined) payload.location = updateData.location;
    const { data } = await api.put<unknown>(API.BOOKING.UPDATE(bookingId), { data: payload });
    return unwrap<BookingEntity>(data);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Forfeit (cancel) a booking. DELETE /booking/:bookingId/forfeit
 */
export async function forfeitBooking(bookingId: string): Promise<void> {
  try {
    await api.delete(API.BOOKING.FORFEIT(bookingId));
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * List bookings. GET /booking/list?technician_id=...&from_date=...
 */
export async function listBookings(params: ListBookingsParams): Promise<ListBookingsResult> {
  try {
    const search = new URLSearchParams();
    if (params.technician_id) search.set('technician_id', params.technician_id);
    if (params.shop_id) search.set('shop_id', params.shop_id);
    if (params.from_date) search.set('from_date', params.from_date);
    if (params.to_date) search.set('to_date', params.to_date);
    if (params.page_size != null) search.set('page_size', String(params.page_size));
    if (params.cursor) search.set('cursor', params.cursor);
    const query = search.toString();
    const url = query ? `${API.BOOKING.LIST}?${query}` : API.BOOKING.LIST;
    const { data } = await api.get<unknown>(url);
    const raw = data as
      | BookingEntity[]
      | { data?: BookingEntity[] | ListBookingsResult; bookings?: BookingEntity[]; next_cursor?: string; page_size?: number };

    if (Array.isArray(raw)) {
      return { bookings: raw };
    }
    if (raw && typeof raw === 'object') {
      const inner = raw.data;
      if (Array.isArray(inner)) {
        return { bookings: inner, next_cursor: raw.next_cursor, page_size: raw.page_size };
      }
      if (inner && typeof inner === 'object' && Array.isArray((inner as ListBookingsResult).bookings)) {
        return inner as ListBookingsResult;
      }
      if (Array.isArray(raw.bookings)) {
        return { bookings: raw.bookings, next_cursor: raw.next_cursor, page_size: raw.page_size };
      }
    }
    return { bookings: [] };
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
