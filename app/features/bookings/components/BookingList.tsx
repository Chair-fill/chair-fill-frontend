"use client";

import { Booking } from "@/lib/types/booking";
import { format } from "date-fns";
import { Clock, User, ClipboardList, TrendingUp } from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
  selectedDate: Date;
}

export default function BookingList({ bookings, selectedDate }: BookingListProps) {
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {format(selectedDate, "EEEE, MMMM do")}
        </h3>
        <span className="text-sm font-medium text-foreground/40">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="bg-[#0a0a0a] rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-foreground/20" />
          </div>
          <p className="text-foreground/40 font-medium">No bookings for this day</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedBookings.map((booking, index) => (
            <div
              key={booking.id}
              className="bg-[#0a0a0a] rounded-2xl border border-border p-4 flex items-center justify-between group hover:border-primary/50 transition-all animate-almost-done-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold leading-none">{format(new Date(booking.startTime), "HH:mm")}</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    {booking.clientName}
                    {booking.status === 'confirmed' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-foreground/60">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {booking.serviceName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(booking.startTime), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {booking.price && (
                  <p className="font-bold text-foreground">${booking.price}</p>
                )}
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/40 mt-1">
                  {booking.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
