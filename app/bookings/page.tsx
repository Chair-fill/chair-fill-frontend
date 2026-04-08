"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Calendar from "@/app/features/bookings/components/Calendar";
import BookingList from "@/app/features/bookings/components/BookingList";
import BookingModal from "@/app/features/bookings/components/BookingModal";
import AddBookingModal from "@/app/features/bookings/components/AddBookingModal";
import AvailabilityModal from "@/app/features/bookings/components/AvailabilityModal";
import { Booking } from "@/lib/types/booking";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { listBookings } from "@/lib/api/bookings";
import { bookingEntityToBooking } from "@/lib/api/booking-mapper";
import { Share2, Plus, Check, Clock, Loader2 } from "lucide-react";

export default function BookingsPage() {
  const { technician, updateTechnician } = useTechnician();
  const technicianId = technician?.technician_id ?? technician?.id ?? "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [copied, setCopied] = useState(false);

  const refreshBookings = useCallback(async () => {
    if (!technicianId) {
      setBookings([]);
      return;
    }
    setBookingsLoading(true);
    setBookingsError("");
    try {
      // Backend requires from_date as a string. Default to ~60 days back so the
      // calendar can show recent history alongside upcoming appointments.
      const since = new Date();
      since.setDate(since.getDate() - 60);
      const fromDate = since.toISOString().split("T")[0];
      const result = await listBookings({
        technician_id: technicianId,
        from_date: fromDate,
        page_size: 200,
      });
      setBookings(result.bookings.map(bookingEntityToBooking));
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : "Failed to load bookings.");
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [technicianId]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const allBookings = bookings;

  // Format a Date as YYYY-MM-DD in the *local* timezone. Avoids the off-by-one
  // bug from .toISOString() which converts local-midnight to a different UTC day.
  const toLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const selectedDateString = toLocalDateString(selectedDate);

  const bookingsForSelectedDate = useMemo(() => {
    return allBookings.filter(
      (b) => toLocalDateString(new Date(b.startTime)) === selectedDateString,
    );
  }, [allBookings, selectedDateString]);

  const bookingDates = useMemo(() => {
    return Array.from(
      new Set(allBookings.map((b) => toLocalDateString(new Date(b.startTime)))),
    );
  }, [allBookings]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsModalOpen(true);
    }
  };

  const handleToggleBlockDay = async () => {
    if (!technician) return;
    const currentBlocked = technician.blocked_dates || [];
    const newBlocked = currentBlocked.includes(selectedDateString)
      ? currentBlocked.filter((d) => d !== selectedDateString)
      : [...currentBlocked, selectedDateString];

    try {
      await updateTechnician({ blocked_dates: newBlocked });
    } catch (err) {
      console.error("Failed to update blocked dates:", err);
    }
  };

  const handleShareLink = () => {
    if (!technicianId) return;
    const link = `${window.location.origin}/book/${technicianId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-32 sm:pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Manage Bookings
              </h1>
              <p className="mt-2 text-foreground/60">
                View and manage your upcoming client appointments.
              </p>
            </div>

            <div className="flex flex-row items-center justify-end gap-2 w-full sm:w-auto mt-10">
              <button
                onClick={handleShareLink}
                disabled={!technicianId}
                className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-foreground hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={copied ? "Copied Link" : "Share Link"}
              >
                {copied ? (
                  <Check className="w-5 h-5 sm:w-4 sm:h-4 text-green-500" />
                ) : (
                  <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline ml-2 text-sm font-bold">
                  {copied ? "Copied Link" : "Share Link"}
                </span>
              </button>
              <button
                onClick={() => setIsAvailabilityModalOpen(true)}
                className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-foreground hover:bg-white/10 transition-all active:scale-95 transition-all"
                aria-label="Working Hours"
              >
                <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                <span className="hidden sm:inline ml-2 text-sm font-bold">
                  Working Hours
                </span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all active:scale-95 shadow-lg"
                aria-label="Add Appointment"
              >
                <Plus className="w-6 h-6 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm font-bold">
                  Add Appointment
                </span>
              </button>
            </div>
          </div>

          {bookingsError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {bookingsError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-4">
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                bookingDates={bookingDates}
                blockedDates={technician?.blocked_dates}
              />

            </div>

            <div className="hidden lg:block lg:col-span-12 xl:col-span-7">
              <div className="bg-card rounded-2xl border border-border p-6 min-h-[500px] shadow-xl">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center h-64 text-foreground/60">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading bookings...
                  </div>
                ) : (
                  <BookingList
                    bookings={bookingsForSelectedDate}
                    selectedDate={selectedDate}
                    isBlocked={technician?.blocked_dates?.includes(
                      selectedDateString,
                    )}
                    onToggleBlock={handleToggleBlockDay}
                    onBookingForfeited={refreshBookings}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookings={bookingsForSelectedDate}
        selectedDate={selectedDate}
        onBookingForfeited={refreshBookings}
      />

      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
        onCreated={refreshBookings}
      />

      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
      />
    </div>
  );
}
