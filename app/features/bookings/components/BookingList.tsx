"use client";

import { Booking } from "@/lib/types/booking";
import { format } from "date-fns";
import { Clock, ClipboardList, TrendingUp, X, Loader2, CalendarX } from "lucide-react";
import { useState } from "react";
import { forfeitBooking, updateBooking } from "@/lib/api/bookings";
import { getApiErrorMessage } from "@/lib/api-client";
import type { CalendarDailyEntry } from "@/lib/api/calendar";

interface BookingListProps {
  bookings: Booking[];
  selectedDate: Date;
  isBlocked?: boolean;
  dailyEntry?: CalendarDailyEntry;
  onToggleBlock?: () => void;
  /** Called after a booking has been forfeited so the parent can refresh. */
  onBookingForfeited?: () => void | Promise<void>;
}

export default function BookingList({ bookings, selectedDate, isBlocked = false, dailyEntry, onToggleBlock, onBookingForfeited }: BookingListProps) {
  const [forfeitingId, setForfeitingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [forfeitError, setForfeitError] = useState("");

  const isClosedByOverride = dailyEntry 
    ? (dailyEntry.open_time === "00:00" && dailyEntry.close_time === "00:00")
    : false;

  const handleToggleStatus = async (booking: Booking) => {
    const id = booking.sourceId ?? booking.id;
    const newStatus = booking.status === "pending" ? "paid" : "pending";
    setTogglingId(id);
    setForfeitError("");
    try {
      await updateBooking(id, { payment_status: newStatus });
      await onBookingForfeited?.();
    } catch (err) {
      setForfeitError(getApiErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleForfeit = async (id: string) => {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    setForfeitingId(id);
    setForfeitError("");
    try {
      await forfeitBooking(id);
      await onBookingForfeited?.();
    } catch (err) {
      setForfeitError(getApiErrorMessage(err));
    } finally {
      setForfeitingId(null);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">
            {format(selectedDate, "EEEE, MMMM do")}
          </h3>
          {(isBlocked || isClosedByOverride) && (
            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/20">
              {isClosedByOverride ? "Closed (Override)" : "Blocked"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBlock}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isBlocked
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            }`}
          >
            {isBlocked ? "Unblock Day" : "Block Day"}
          </button>
          <span className="text-sm font-medium text-foreground/40 shrink-0">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        </div>
      </div>

      {(isBlocked || isClosedByOverride) && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
            {isClosedByOverride ? (
              <CalendarX className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {isClosedByOverride ? "Closed via date-specific override" : "This day is blocked"}
            </p>
            <p className="text-xs text-foreground/60">
              {isClosedByOverride 
                ? "You have manually set this date as closed in your working hours." 
                : "New bookings cannot be made for this date."}
            </p>
          </div>
        </div>
      )}

      {forfeitError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
          {forfeitError}
        </div>
      )}

      {sortedBookings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-foreground/20" />
          </div>
          <p className="text-foreground/40 font-medium">No bookings for this day</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedBookings.map((booking, index) => (
            <div
              key={booking.id}
              className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between group hover:border-primary/50 transition-all animate-almost-done-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold leading-none">{format(new Date(booking.startTime), "HH:mm")}</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {booking.clientName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-foreground/60">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {booking.serviceName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(booking.startTime), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  {booking.price && (
                    <p className="font-bold text-foreground">${booking.price}</p>
                  )}
                  {booking.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(booking)}
                      disabled={togglingId !== null}
                      className="group/toggle flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={booking.status === "pending" ? "Mark as paid" : "Mark as pending"}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === "confirmed" ? "text-green-500" : "text-yellow-500"
                      }`}>
                        {togglingId === (booking.sourceId ?? booking.id)
                          ? "..."
                          : booking.status === "confirmed" ? "Paid" : "Pending"}
                      </span>
                      <div className={`relative w-8 h-[18px] rounded-full transition-colors ${
                        booking.status === "confirmed" ? "bg-green-500" : "bg-zinc-600"
                      }`}>
                        <div className={`absolute top-[3px] w-3 h-3 rounded-full bg-white transition-all ${
                          booking.status === "confirmed" ? "left-[14px]" : "left-[3px]"
                        }`} />
                      </div>
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border bg-red-500/10 text-red-500 border-red-500/20">
                      Cancelled
                    </span>
                  )}
                </div>
                {booking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleForfeit(booking.sourceId ?? booking.id)}
                    disabled={forfeitingId !== null}
                    className="p-2 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Cancel booking for ${booking.clientName}`}
                    title="Cancel booking"
                  >
                    {forfeitingId === (booking.sourceId ?? booking.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
