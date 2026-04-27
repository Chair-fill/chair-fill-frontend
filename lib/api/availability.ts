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
  working_hours?: {
    timezone: string;
    date: string;
    weekday: string;
    open_time: string;
    close_time: string;
    off_times?: [string, string][];
    time_of_day?: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
}

// Simple in-memory cache for enquire results to avoid duplicate fetches
const _enquireCache: Record<string, { data: [number, number][]; ts: number }> = {};
const ENQUIRE_CACHE_TTL = 60_000; // 1 minute

/** Clear the enquire cache (call after the barber updates working hours). */
export function clearEnquireCache(technicianId?: string): void {
  if (technicianId) {
    for (const key of Object.keys(_enquireCache)) {
      if (key.startsWith(`${technicianId}:`)) delete _enquireCache[key];
    }
  } else {
    for (const key of Object.keys(_enquireCache)) delete _enquireCache[key];
  }
}

/** Local date key (YYYY-MM-DD) for caching — avoids UTC off-by-one. */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Call the enquire endpoint for a single date.
 * Returns the available_times ranges, or [] on error.
 * Cached per (technicianId, local date) for 1 minute.
 *
 * @param startTime HH:mm — the working-hours start for this day. When provided,
 *   the query date's time is set to this (not midnight) so the backend treats
 *   the query as starting at the open time. For today, the current time is
 *   used instead when it's after the start time.
 */
export async function enquireDate(
  technicianId: string,
  date: Date,
  startTime?: string,
): Promise<[number, number][]> {
  const cacheKey = `${technicianId}:${dateKey(date)}`;
  const cached = _enquireCache[cacheKey];
  if (cached && Date.now() - cached.ts < ENQUIRE_CACHE_TTL) {
    return cached.data;
  }

  try {
    const now = new Date();
    const queryDate = new Date(date);

    const isToday = now.getFullYear() === queryDate.getFullYear() &&
                    now.getMonth() === queryDate.getMonth() &&
                    now.getDate() === queryDate.getDate();

    const [startH, startM] = (startTime ?? "00:00").split(":").map(Number);

    if (isToday) {
      const startMins = startH * 60 + startM;
      const nowMins = now.getHours() * 60 + now.getMinutes();
      if (nowMins >= startMins) {
        queryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
      } else {
        queryDate.setHours(startH, startM, 0, 0);
      }
    } else {
      queryDate.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      queryDate.setUTCHours(startH, startM, 0, 0);
    }

    const url = `${API.AVAILABILITY.ENQUIRE(technicianId)}?date=${queryDate.toISOString()}&slot_index=0`;
    const { data } = await api.get<unknown>(url);
    const res = data as {
      data?: { available_times?: [number, number][] };
      available_times?: [number, number][];
    };
    const ranges = res?.data?.available_times ?? res?.available_times ?? [];
    _enquireCache[cacheKey] = { data: ranges, ts: Date.now() };
    return ranges;
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
 * Fetch the barber's weekly hours via GET /availability/me.
 * Returns the normalized per-day open/close schedule.
 * Results are cached for 1 minute per technician (per date if provided).
 */
export async function fetchWeeklyAvailability(
  technicianId: string,
  date?: string,
): Promise<import('@/app/providers/TechnicianProvider').Availability> {
  type Avail = import('@/app/providers/TechnicianProvider').Availability;
  type DS = import('@/app/providers/TechnicianProvider').DaySchedule;

  // Return cached result if fresh
  const cacheKey = date ? `${technicianId}:${date}` : technicianId;
  const cached = _weeklyCache[cacheKey];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const WEEKDAYS_ORDER: Weekday[] = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  ];

  const res = await getAvailability({ technician_id: technicianId, date });

  // The weekdays object may be at the top level (after NestJS unwrap) or nested under `availability`
  const r = res as Record<string, unknown>;
  const avail = (r.availability && typeof r.availability === 'object'
    ? r.availability
    : null) as Record<string, unknown> | null;
  const weekdays = (r.weekdays as Partial<Record<Weekday, WeekdayWindow>> | undefined) ??
    (avail?.weekdays as Partial<Record<Weekday, WeekdayWindow>> | undefined);

  const fallbackOpen = (r.open_time as string | undefined) ??
    (avail?.open_time as string | undefined) ?? "09:00";
  const fallbackClose = (r.close_time as string | undefined) ??
    (avail?.close_time as string | undefined) ?? "18:00";

  const normalized: Avail = {} as Avail;
  for (const day of WEEKDAYS_ORDER) {
    const entry = weekdays?.[day];
    if (entry && entry.open_time && entry.close_time) {
      const isClosed = entry.open_time === "00:00" && entry.close_time === "00:00";
      normalized[day] = {
        isOpen: !isClosed,
        from: isClosed ? fallbackOpen : entry.open_time,
        to: isClosed ? fallbackClose : entry.close_time,
      } as DS;
    } else {
      // No entry for this day — treat as closed
      normalized[day] = {
        isOpen: false,
        from: fallbackOpen,
        to: fallbackClose,
      } as DS;
    }
  }

  _weeklyCache[cacheKey] = { data: normalized, ts: Date.now() };
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
