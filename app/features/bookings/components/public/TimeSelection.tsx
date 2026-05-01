"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isToday, isAfter, parse } from "date-fns";
import { Clock, Loader2, Sun, Sunset, Moon } from "lucide-react";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { useParams } from "next/navigation";
import { enquireDate } from "@/lib/api/availability";
import type { Availability } from "@/app/providers/TechnicianProvider";
import type { CalendarDailyEntry } from "@/lib/api/calendar";

const DAY_INDEX_TO_NAME: Record<number, keyof Availability> = {
  0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
  4: "thursday", 5: "friday", 6: "saturday",
};

interface TimeSelectionProps {
  availability?: Availability;
  dailyEntries?: Record<string, CalendarDailyEntry>;
}

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
 */
function rangesToSlots(ranges: [number, number][], date: Date, duration: number): string[] {
  const slots: string[] = [];
  const now = new Date();

  for (const [start, end] of ranges) {
    let current = start;
    // We use a 30-minute step for the slots picker
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

export default function TimeSelection({ availability, dailyEntries }: TimeSelectionProps) {
  const params = useParams();
  const barberId = (params?.barberId as string) ?? "";
  const { selectedDate, selectedTime, setSelectedTime, selectedService, setStep } = usePublicBooking();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate || !barberId || !selectedService) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;

    const override = dailyEntries?.[dateKey];
    const dayName = DAY_INDEX_TO_NAME[selectedDate.getDay()];
    const weekly = availability?.[dayName];

    const startTime = (override && override.open_time && override.open_time !== "00:00")
      ? override.open_time
      : weekly?.isOpen ? weekly.from : undefined;

    enquireDate(barberId, selectedDate, startTime)
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
  }, [selectedDate, barberId, selectedService, availability]);

  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    slots.forEach(slot => {
      const hour = parseInt(slot.split(":")[0]);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [slots]);

  const handleSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  if (!selectedDate) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Available Times</h2>
          <p className="text-sm text-zinc-500 font-medium">For {format(selectedDate, "EEEE, MMMM do")}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Clock className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-8">
        {loadingSlots ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
            <span className="text-sm font-black uppercase tracking-widest text-primary/60">Finding Slots</span>
          </div>
        ) : slots.length > 0 ? (
          <>
            {/* Morning */}
            {groupedSlots.morning.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Sun className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Morning</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {groupedSlots.morning.map((time) => (
                    <TimeButton key={time} time={time} isSelected={selectedTime === time} onSelect={handleSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {groupedSlots.afternoon.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Sunset className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Afternoon</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {groupedSlots.afternoon.map((time) => (
                    <TimeButton key={time} time={time} isSelected={selectedTime === time} onSelect={handleSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Evening */}
            {groupedSlots.evening.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Moon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Evening</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {groupedSlots.evening.map((time) => (
                    <TimeButton key={time} time={time} isSelected={selectedTime === time} onSelect={handleSelect} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 px-6 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
            <p className="text-zinc-500 font-medium">No available slots for this date.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function TimeButton({ time, isSelected, onSelect }: { time: string, isSelected: boolean, onSelect: (t: string) => void }) {
  return (
    <button
      onClick={() => onSelect(time)}
      className={`py-3.5 rounded-xl text-xs font-black transition-all duration-300 border ${
        isSelected
          ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105"
          : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/5 active:scale-95"
      }`}
    >
      {formatTime12h(time)}
    </button>
  );
}
