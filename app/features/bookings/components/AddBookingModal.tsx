import { useState, useEffect } from "react";
import { X, Calendar, User, Clock, DollarSign, Text } from "lucide-react";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";
import { Booking } from "@/lib/types/booking";

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (booking: Booking) => void;
  selectedDate: Date;
}

export default function AddBookingModal({
  isOpen,
  onClose,
  onAdd,
  selectedDate,
}: AddBookingModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    serviceName: "",
    time: "10:00",
    price: "",
    notes: "",
  });

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 400); // Match animation duration from globals.css
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  if (!shouldRender) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [hours, minutes] = formData.time.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    
    const end = new Date(start);
    end.setHours(start.getHours() + 1); // Default 1 hour duration

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: formData.clientName,
      serviceName: formData.serviceName,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: "confirmed",
      price: Number(formData.price),
      notes: formData.notes,
    };

    onAdd(newBooking);
    onClose();
    setFormData({
      clientName: "",
      serviceName: "",
      time: "10:00",
      price: "",
      notes: "",
    });
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative bg-card rounded-t-3xl sm:rounded-2xl border-t sm:border border-border shadow-2xl w-full max-w-md overflow-hidden ${
          isAnimatingOut ? "animate-slide-down" : "animate-slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Appointment</h2>
            <p className="text-sm text-foreground/40 mt-1">
              Manual entry for your records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto pb-32">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
              Client Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                <input
                  required
                  type="time"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
                Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                <input
                  type="number"
                  placeholder="35"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
              Service
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
              <input
                required
                type="text"
                placeholder="Skin Fade"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider ml-1">
              Notes (Optional)
            </label>
            <div className="relative">
              <Text className="absolute left-4 top-4 w-4 h-4 text-foreground/20" />
              <textarea
                placeholder="Client likes natural finish..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-foreground font-bold py-4 rounded-xl transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
