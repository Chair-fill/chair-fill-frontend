import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Booking } from "@/lib/types/booking";
import BookingList from "./BookingList";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  selectedDate: Date;
  onBookingForfeited?: () => void | Promise<void>;
}

export default function BookingModal({
  isOpen,
  onClose,
  bookings,
  selectedDate,
  onBookingForfeited,
}: BookingModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  // Animating out = currently rendered but parent flipped isOpen to false.
  const isAnimatingOut = shouldRender && !isOpen;

  // Sync shouldRender when isOpen flips to true via render-time state update.
  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    if (isOpen || !shouldRender) return;
    const timer = setTimeout(() => setShouldRender(false), 400);
    return () => clearTimeout(timer);
  }, [isOpen, shouldRender]);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-card rounded-t-3xl sm:rounded-2xl border-t sm:border border-border shadow-xl w-full max-w-lg overflow-hidden ${
          isAnimatingOut ? "animate-slide-down" : "animate-slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Appointments</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto pb-24">
          <BookingList
            bookings={bookings}
            selectedDate={selectedDate}
            onBookingForfeited={onBookingForfeited}
          />
        </div>
      </div>
    </div>
  );
}
