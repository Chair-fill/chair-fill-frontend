"use client";

import { useMemo } from "react";
import { format, addMinutes, parse, isBefore, isAfter, startOfToday, isToday } from "date-fns";
import { Clock, Check } from "lucide-react";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { Availability } from "@/app/providers/TechnicianProvider";

interface TimeSelectionProps {
  availability?: Availability;
}

export default function TimeSelection({ availability }: TimeSelectionProps) {
  const { selectedDate, selectedTime, setSelectedTime, selectedService, setStep } = usePublicBooking();

  const slots = useMemo(() => {
    if (!selectedDate || !availability || !selectedService) return [];

    const dayName = format(selectedDate, "eeee").toLowerCase() as keyof Availability;
    const daySchedule = availability[dayName];

    if (!daySchedule || !daySchedule.isOpen) return [];

    const startTime = parse(daySchedule.from, "HH:mm", selectedDate);
    const endTime = parse(daySchedule.to, "HH:mm", selectedDate);
    const duration = selectedService.duration;

    const timeSlots = [];
    let current = startTime;

    while (isBefore(current, addMinutes(endTime, -duration)) || current.getTime() === addMinutes(endTime, -duration).getTime()) {
      // Check if time is in the past if it's today
      if (isToday(selectedDate)) {
        if (isAfter(current, new Date())) {
          timeSlots.push(format(current, "HH:mm"));
        }
      } else {
        timeSlots.push(format(current, "HH:mm"));
      }
      current = addMinutes(current, 30); // 30 min intervals
    }

    return timeSlots;
  }, [selectedDate, availability, selectedService]);

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

      {slots.length === 0 && (
        <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
          <p className="text-zinc-500 font-medium">No available slots for this date.</p>
        </div>
      )}
    </div>
  );
}
