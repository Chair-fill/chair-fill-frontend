"use client";

import { useState, useEffect } from "react";
import { format, isToday, isAfter } from "date-fns";
import { Clock, Loader2 } from "lucide-react";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { useParams } from "next/navigation";
import { enquireDate } from "@/lib/api/availability";

/** Format "HH:mm" to 12-hour display (e.g. "14:30" → "2:30 PM") */
function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Convert minutes-from-midnight to "HH:mm" */
function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Expand an array of [startMin, endMin] ranges into 30-minute slot strings.
 * Filters out past slots if the date is today.
 */
function rangesToSlots(ranges: [number, number][], date: Date, duration: number): string[] {
  const slots: string[] = [];
  const now = new Date();

  for (const [start, end] of ranges) {
    let current = start;
    while (current + duration <= end) {
      const time = minutesToHHMM(current);
      if (isToday(date)) {
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(current / 60), current % 60, 0, 0);
        if (isAfter(slotDate, now)) {
          slots.push(time);
        }
      } else {
        slots.push(time);
      }
      current += 30;
    }
  }

  return slots;
}

export default function TimeSelection() {
  const params = useParams();
  const barberId = (params?.barberId as string) ?? "";
  const { selectedDate, selectedTime, setSelectedTime, selectedService, setStep } = usePublicBooking();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch date-specific available time windows from the enquire endpoint
  useEffect(() => {
    if (!selectedDate || !barberId || !selectedService) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);

    enquireDate(barberId, selectedDate)
      .then((ranges) => {
        if (cancelled) return;
        setSlots(rangesToSlots(ranges, selectedDate, selectedService.duration));
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
  }, [selectedDate, barberId, selectedService]);

  const handleSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  if (!selectedDate) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Available Times</h2>
          <p className="text-sm text-zinc-500 font-medium">For {format(selectedDate, "EEEE, MMMM do")}</p>
        </div>
        <div className="p-2 sm:p-3 bg-primary/10 rounded-2xl">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>

      {loadingSlots ? (
        <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading available times...</span>
        </div>
      ) : slots.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {slots.map((time) => {
            const selected = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => handleSelect(time)}
                className={`py-4 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                  selected
                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
                }`}
              >
                {formatTime12h(time)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
          <p className="text-zinc-500 font-medium">No available slots for this date.</p>
        </div>
      )}
    </div>
  );
}
