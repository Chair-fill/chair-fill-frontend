import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

/** Period enum for availability updates. */
export enum AvailabilityUpdatePeriod {
  ONLY_ON_DAY = 'only_on_day',
  DAY_OF_WEEK = 'day_of_week',
  FROM_NOW_HENCE_FORTH = 'from_now_hence_forth',
}

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

/** Response shape from GET /availability/:id/enquire */
export interface EnquireResponse {
  available_times: [number, number][];
  slot_index: number;
}

/** Convert minutes-from-midnight to "HH:mm" */
function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Call the enquire endpoint for a single date.
 * Returns the available_times ranges, or [] on error.
 */
export async function enquireDate(
  technicianId: string,
  date: Date,
): Promise<[number, number][]> {
  try {
    const now = new Date();
    const queryDate = new Date(date);
    
    // If searching for today, use the current time to get only the remaining slots.
    // Otherwise, use 00:00:00 (which is typically set by the calendar components).
    const isToday = now.getFullYear() === queryDate.getFullYear() && 
                    now.getMonth() === queryDate.getMonth() && 
                    now.getDate() === queryDate.getDate();
    
    if (isToday) {
      // Use current time to filter for today
      queryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
    } else {
      // For future dates, use start of the day in UTC (00:00:00.000Z)
      // We use the local date parts to ensure it refers to the intended calendar day
      queryDate.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      queryDate.setUTCHours(0, 0, 0, 0);
    }

    const url = `${API.AVAILABILITY.ENQUIRE(technicianId)}?date=${encodeURIComponent(queryDate.toISOString())}&slot_index=0`;
    const { data } = await api.get<unknown>(url);
    const res = data as {
      data?: { available_times?: [number, number][] };
      available_times?: [number, number][];
    };
    return res?.data?.available_times ?? res?.available_times ?? [];
  } catch {
    return [];
  }
}

/** Clear the weekly availability cache (call after updating working hours). */
export function clearWeeklyAvailabilityCache(technicianId?: string): void {
  if (technicianId) {
    delete _weeklyCache[technicianId];
  } else {
    for (const key of Object.keys(_weeklyCache)) delete _weeklyCache[key];
  }
}

// Simple cache to avoid repeated 7-request bursts for the same technician
const _weeklyCache: Record<string, { data: import('@/app/providers/TechnicianProvider').Availability; ts: number }> = {};
const CACHE_TTL = 60_000; // 1 minute

/**
 * Build weekly availability by calling the enquire endpoint for one
 * representative date per weekday (the next 7 days starting from today).
 * A day with no available_times is treated as closed.
 * Results are cached for 1 minute per technician.
 */
export async function enquireWeeklyAvailability(
  technicianId: string,
): Promise<import('@/app/providers/TechnicianProvider').Availability> {
  type Avail = import('@/app/providers/TechnicianProvider').Availability;
  type DS = import('@/app/providers/TechnicianProvider').DaySchedule;

  // Return cached result if fresh
  const cached = _weeklyCache[technicianId];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const DAY_NAMES: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  // Build 7 dates starting from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  // Fetch sequentially to avoid 429 rate limiting
  const results: [number, number][][] = [];
  for (const d of dates) {
    results.push(await enquireDate(technicianId, d));
  }

  const normalized: Avail = {} as Avail;
  for (let i = 0; i < 7; i++) {
    const dayName = DAY_NAMES[dates[i].getDay()];
    const ranges = results[i];
    if (ranges.length > 0) {
      const earliest = ranges[0][0];
      const latest = ranges[ranges.length - 1][1];
      normalized[dayName] = {
        isOpen: true,
        from: minutesToHHMM(earliest),
        to: minutesToHHMM(latest),
      } as DS;
    } else {
      normalized[dayName] = {
        isOpen: false,
        from: "09:00",
        to: "18:00",
      } as DS;
    }
  }
  _weeklyCache[technicianId] = { data: normalized, ts: Date.now() };
  return normalized;
}

/** PUT /availability/update body. Provide exactly one of technician_id / shop_id. */
export interface UpdateAvailabilityBody {
  technician_id?: string;
  shop_id?: string;
  /** [openTime, closeTime] e.g. ["09:00", "17:00"] */
  availableTime: [string, string];
  period: AvailabilityPeriod | AvailabilityUpdatePeriod;
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
