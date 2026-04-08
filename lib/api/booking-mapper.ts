import type { BookingEntity } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types/booking";

/** Best-effort full name from a contact-shaped object. */
function contactName(contact: Record<string, unknown> | null | undefined): string {
  if (!contact || typeof contact !== "object") return "";
  const first = (contact.first_name as string | undefined) ?? "";
  const middle = (contact.middle_name as string | undefined) ?? "";
  const last = (contact.last_name as string | undefined) ?? "";
  const nick = (contact.nick_name as string | undefined) ?? "";
  const composed = [first, middle, last].filter(Boolean).join(" ").trim();
  return composed || nick || (contact.email as string | undefined) || "";
}

/** Sum of services_snapshot prices. */
function totalPrice(entity: BookingEntity): number {
  const snap = entity.services_snapshot;
  if (!Array.isArray(snap)) return 0;
  return snap.reduce((sum, s) => {
    const unit = typeof s.unit_price === "number" ? s.unit_price : Number(s.unit_price ?? 0);
    const units = typeof s.units === "number" ? s.units : Number(s.units ?? 1);
    if (!Number.isFinite(unit) || !Number.isFinite(units)) return sum;
    return sum + unit * units;
  }, 0);
}

/** Map backend payment_status into the UI's tri-state booking status. */
function mapStatus(entity: BookingEntity): Booking["status"] {
  const ps = (entity.payment_status ?? "").toLowerCase();
  if (ps === "paid" || ps === "succeeded" || ps === "completed") return "confirmed";
  if (ps === "cancelled" || ps === "canceled" || ps === "forfeited") return "cancelled";
  return "pending";
}

/** Convert a backend BookingEntity to the UI Booking shape. */
export function bookingEntityToBooking(entity: BookingEntity): Booking {
  const serviceName =
    entity.services_snapshot?.map((s) => s.name).filter(Boolean).join(", ") ||
    "Service";
  const clientName =
    contactName(entity.contact as Record<string, unknown> | null) || "Client";

  return {
    id: entity.id,
    clientName,
    serviceName,
    startTime: entity.start_date,
    endTime: entity.end_date,
    status: mapStatus(entity),
    price: totalPrice(entity) || undefined,
    sourceId: entity.id,
    paymentStatus: entity.payment_status,
  };
}
