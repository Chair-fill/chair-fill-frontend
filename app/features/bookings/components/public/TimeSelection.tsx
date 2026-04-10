"use client";

import { useMemo, useState, useEffect } from "react";
import { format, addMinutes, parse, isBefore, isAfter, isToday } from "date-fns";
import { Clock, Loader2 } from "lucide-react";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { useParams } from "next/navigation";
import { Availability } from "@/app/providers/TechnicianProvider";
import { getAvailability } from "@/lib/api/availability";

interface TimeSelectionProps {
  availability?: Availability;
}

export default function TimeSelection({ availability }: TimeSelectionProps) {
  const params = useParams();
  const barberId = (params?.barberId as string) ?? "";
  const { selectedDate, selectedTime, setSelectedTime, selectedService, setStep } = usePublicBooking();
  const [apiSlots, setApiSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch date-specific availability from the backend when a date is selected
  useEffect(() => {
    if (!selectedDate || !barberId) {
      setApiSlots(null);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    setApiSlots(null);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    getAvailability({ technician_id: barberId, date: dateStr })
      .then((res) => {
        if (cancelled) return;
        const slots = res?.available_slots ?? res?.availability?.available_slots;
        if (Array.isArray(slots) && slots.length > 0) {
          setApiSlots(slots);
        } else {
          setApiSlots(null);
        }
      })
      .catch(() => {
        if (!cancelled) setApiSlots(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
  }, [selectedDate, barberId]);

  // Generate slots from the weekly schedule as a fallback
  const fallbackSlots = useMemo(() => {
    if (!selectedDate || !availability || !selectedService) return [];

    const dayName = format(selectedDate, "eeee").toLowerCase() as keyof Availability;
    const daySchedule = availability[dayName];

    if (!daySchedule || !daySchedule.isOpen) return [];

    const startTime = parse(daySchedule.from, "HH:mm", selectedDate);
    const endTime = parse(daySchedule.to, "HH:mm", selectedDate);
    const duration = selectedService.duration;

    const timeSlots: string[] = [];
    let current = startTime;

    while (isBefore(current, addMinutes(endTime, -duration)) || current.getTime() === addMinutes(endTime, -duration).getTime()) {
      if (isToday(selectedDate)) {
        if (isAfter(current, new Date())) {
          timeSlots.push(format(current, "HH:mm"));
        }
      } else {
        timeSlots.push(format(current, "HH:mm"));
      }
      current = addMinutes(current, 30);
    }

    return timeSlots;
  }, [selectedDate, availability, selectedService]);

  // Use API slots when available, otherwise fall back to generated slots
  const slots = apiSlots ?? fallbackSlots;

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
                {format(parse(time, "HH:mm", new Date()), "h:mm a")}
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
