"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  bookingDates?: string[]; // Array of YYYY-MM-DD strings
  blockedDates?: string[]; // Array of YYYY-MM-DD strings
}

export default function Calendar({ selectedDate, onDateSelect, bookingDates = [], blockedDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-12" />);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      // Build local YYYY-MM-DD (not UTC) so the key matches the page's
      // local-bucketed bookingDates / blockedDates lists.
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasBookings = bookingDates.includes(dateString);
      const isBlocked = blockedDates.includes(dateString);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;

      days.push(
        <button
          key={d}
          onClick={() => onDateSelect(date)}
          disabled={isPast}
          className={`relative h-10 sm:h-12 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
            isSelected
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10"
              : isPast
                ? "text-foreground/30 cursor-not-allowed"
                : isBlocked
                  ? "bg-red-500/10 text-red-500/60 border border-red-500/20"
                  : "text-foreground hover:bg-white/5"
          } ${isToday && !isSelected ? "border border-primary/40 text-primary" : ""}`}
        >
          {d}
          {hasBookings && !isSelected && !isBlocked && (
            <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isPast ? "bg-foreground/30" : "bg-primary"}`} />
          )}
          {isBlocked && !isSelected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-[1px] bg-red-500 rotate-45" />
              <div className="w-full h-[1px] bg-red-500 -rotate-45 absolute" />
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/5 rounded-full text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/5 rounded-full text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs font-bold text-foreground/40 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
