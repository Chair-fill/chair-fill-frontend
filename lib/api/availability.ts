import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

/** Period enum for availability updates. */
export type AvailabilityPeriod = 'only_on_day' | 'day_of_week' | 'from_now_hence_forth';
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/** GET /availability/me query params. Either technician_id or shop_id is required. */
export type GetAvailabilityParams = {
  /** YYYY-MM-DD */
  date?: string;
} & ({ technician_id: string; shop_id?: string } | { shop_id: string; technician_id?: string });

/** Per-day window the backend stores under `weekdays.{day}`. */
export interface WeekdayWindow {
  open_time: string;
  close_time: string;
}

/**
 * Inner availability object as returned by GET /availability/me.
 * Shape: { open_time, close_time, timezone, weekdays: { monday: {...}, ... }, availability: { morning, ... } }
 */
export interface AvailabilityRecord {
  id?: string;
  open_time?: string;
  close_time?: string;
  timezone?: string;
  weekdays?: Partial<Record<Weekday, WeekdayWindow>>;
  /** Time-of-day flags + off_times — separate from the per-weekday schedule. */
  availability?: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    off_times?: [string, string][];
  };
  available_slots?: string[];
}

/**
 * Outer envelope returned by GET /availability/me. The interesting bit is
 * `availability.weekdays`, which holds the per-weekday open/close times.
 */
export interface AvailabilityResponse {
  source?: string;
  availability?: AvailabilityRecord;
  /** Some single-day variants may inline these directly. */
  open_time?: string;
  close_time?: string;
  available_slots?: string[];
  [key: string]: unknown;
}

/** PUT /availability/update body. Provide exactly one of technician_id / shop_id. */
export interface UpdateAvailabilityBody {
  technician_id?: string;
  shop_id?: string;
  /** [openTime, closeTime] e.g. ["09:00", "17:00"] */
  availableTime: [string, string];
  period: AvailabilityPeriod;
  /** YYYY-MM-DD — required when period === 'only_on_day' */
  date?: string;
  /** Required when period === 'day_of_week' */
  weekday?: Weekday;
  /** Off-time ranges within the day, e.g. [["12:00","13:00"]] */
  off_times?: [string, string][];
}

/**
 * Get availability for a technician or shop.
 * GET /availability/me?technician_id=...&date=YYYY-MM-DD
 * Public — no JWT required.
 */
export async function getAvailability(
  params: GetAvailabilityParams,
): Promise<AvailabilityResponse> {
  try {
    const search = new URLSearchParams();
    if (params.technician_id) search.set('technician_id', params.technician_id);
    if (params.shop_id) search.set('shop_id', params.shop_id);
    if (params.date) search.set('date', params.date);
    
    if (!params.technician_id && !params.shop_id) {
      throw new Error('Either technician_id or shop_id is required to get availability.');
    }

    const query = search.toString();
    const url = query ? `${API.AVAILABILITY.ME}?${query}` : API.AVAILABILITY.ME;
    const { data } = await api.get<unknown>(url);
    const raw = data as { data?: AvailabilityResponse } & AvailabilityResponse;
    return (raw?.data ?? raw) as AvailabilityResponse;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

/**
 * Update availability. PUT /availability/update (JWT).
 * Provide exactly one of technician_id / shop_id.
 */
export async function updateAvailability(
  body: UpdateAvailabilityBody,
): Promise<AvailabilityResponse> {
  try {
    const payload: Record<string, unknown> = {
      availableTime: body.availableTime,
      period: body.period,
    };
    if (body.technician_id) payload.technician_id = body.technician_id;
    if (body.shop_id) payload.shop_id = body.shop_id;
    if (body.date) payload.date = body.date;
    if (body.weekday) payload.weekday = body.weekday;
    if (body.off_times) payload.off_times = body.off_times;
    const { data } = await api.put<unknown>(API.AVAILABILITY.UPDATE, payload);
    const raw = data as { data?: AvailabilityResponse } & AvailabilityResponse;
    return (raw?.data ?? raw) as AvailabilityResponse;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}
