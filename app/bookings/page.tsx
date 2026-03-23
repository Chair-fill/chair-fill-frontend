"use client";

import { useState, useMemo } from "react";
import Calendar from "@/app/features/bookings/components/Calendar";
import BookingList from "@/app/features/bookings/components/BookingList";
import BookingModal from "@/app/features/bookings/components/BookingModal";
import AddBookingModal from "@/app/features/bookings/components/AddBookingModal";
import AvailabilityModal from "@/app/features/bookings/components/AvailabilityModal";
import { Booking } from "@/lib/types/booking";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { Share2, Plus, Check, Clock } from "lucide-react";

// Mock data generator
const generateMockBookings = (): Booking[] => {
  const today = new Date();
  const bookings: Booking[] = [
    {
      id: "1",
      clientName: "John Doe",
      serviceName: "Skin Fade",
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        0,
      ).toISOString(),
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        11,
        0,
      ).toISOString(),
      status: "confirmed",
      price: 35,
    },
    {
      id: "2",
      clientName: "Jane Smith",
      serviceName: "Full Service",
      startTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        11,
        30,
      ).toISOString(),
      endTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        13,
        0,
      ).toISOString(),
      status: "confirmed",
      price: 65,
    },
  ];
  return bookings;
};

export default function BookingsPage() {
  const { technician, updateTechnician } = useTechnician();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [extraBookings, setExtraBookings] = useState<Booking[]>([]);
  const [copied, setCopied] = useState(false);

  const allBookings = useMemo(() => {
    return [...generateMockBookings(), ...extraBookings];
  }, [extraBookings]);

  const selectedDateString = selectedDate.toISOString().split("T")[0];

  const bookingsForSelectedDate = useMemo(() => {
    return allBookings.filter((b) =>
      b.startTime.startsWith(selectedDateString),
    );
  }, [allBookings, selectedDateString]);

  const bookingDates = useMemo(() => {
    return Array.from(
      new Set(allBookings.map((b) => b.startTime.split("T")[0])),
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
    const link = `${window.location.origin}/book/barber-id`; // Placeholder
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
                className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-foreground hover:bg-white/10 transition-all active:scale-95 transition-all"
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-4">
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                bookingDates={bookingDates}
                blockedDates={technician?.blocked_dates}
              />

              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Share2 className="w-32 h-32" />
                </div>
                <h3 className="font-bold text-foreground mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1">
                      Weekly Revenue
                    </p>
                    <p className="text-2xl font-bold text-primary">$420</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1">
                      New Clients
                    </p>
                    <p className="text-2xl font-bold text-foreground">12</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-12 xl:col-span-7">
              <div className="bg-card rounded-2xl border border-border p-6 min-h-[500px] shadow-xl">
                <BookingList
                  bookings={bookingsForSelectedDate}
                  selectedDate={selectedDate}
                  isBlocked={technician?.blocked_dates?.includes(
                    selectedDateString,
                  )}
                  onToggleBlock={handleToggleBlockDay}
                />
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
      />

      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
        onAdd={(booking) => setExtraBookings([...extraBookings, booking])}
      />

      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
      />
    </div>
  );
}
