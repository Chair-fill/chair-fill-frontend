"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { Availability } from "@/app/providers/TechnicianProvider";
import type { CalendarDailyEntry } from "@/lib/api/calendar";

interface ClientCalendarProps {
  technicianId?: string;
  availability?: Availability;
  dailyEntries?: Record<string, CalendarDailyEntry>;
  blockedDates?: string[];
  isLoading?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_ARRAY: string[] = [];

export default function ClientCalendar({ 
  technicianId, 
  availability, 
  dailyEntries = {},
  blockedDates = EMPTY_ARRAY, 
  isLoading = false 
}: ClientCalendarProps) {
  const { selectedDate, setSelectedDate } = usePublicBooking();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startDay = getDay(start);
    const padding = Array(startDay).fill(null);
    return [...padding, ...daysInMonth];
  }, [currentMonth]);


  const isDayAvailable = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return false;

    const dateString = format(date, "yyyy-MM-dd");
    if (blockedDates.includes(dateString)) return false;

    // Date-specific override check
    const dailyEntry = dailyEntries[dateString];
    if (dailyEntry) {
      const isClosed = dailyEntry.open_time === "00:00" && dailyEntry.close_time === "00:00";
      if (isClosed) return false;
    }

    // Per-day weekly schedule fallback
    const dayName = format(date, "eeee").toLowerCase() as keyof Availability;
    const day = availability?.[dayName];
    if (day && day.isOpen === false) return false;

    return true;
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-xl font-bold text-zinc-50 tracking-tight">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-zinc-50 border border-transparent hover:border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-zinc-50 border border-transparent hover:border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 pb-4">
            {day}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className={`grid grid-cols-7 gap-1 sm:gap-2 transition-all duration-300 ${isLoading ? "opacity-30 blur-[2px] pointer-events-none" : ""}`}>
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            
            const available = isDayAvailable(date);
            const selected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <button
                key={date.toISOString()}
                disabled={!available}
                onClick={() => setSelectedDate(date)}
                className={`relative aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 ${
                  selected
                    ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105"
                    : available
                      ? "text-zinc-100 hover:bg-white/10 hover:scale-110 active:scale-95 cursor-pointer"
                      : "text-zinc-700 cursor-not-allowed opacity-40 grayscale"
                }`}
              >
                {format(date, "d")}
                {selected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/5 rounded-[2rem] z-20 animate-in fade-in duration-300">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Updating Availability</p>
          </div>
        )}

      </div>

      {!selectedDate && (
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-xs font-medium bg-black/20 py-3 rounded-2xl border border-white/5">
          <CalendarIcon className="w-4 h-4" />
          <span>Select a date to see available times</span>
        </div>
      )}
    </div>
  );
}
