"use client";

import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User, Mail, Phone, ShieldCheck, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { createBooking } from "@/lib/api/bookings";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { API } from "@/lib/constants/api";

export default function BookingSummary() {
  const params = useParams();
  const barberId = (params?.barberId as string) ?? "";
  const {
    selectedService,
    selectedDate,
    selectedTime,
    guestInfo,
    setStep,
    resetBooking
  } = usePublicBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !barberId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const start = new Date(selectedDate);
      start.setHours(hours || 0, minutes || 0, 0, 0);

      const fullname = [guestInfo.firstName, guestInfo.lastName]
        .filter((s) => s && s.trim())
        .join(" ")
        .trim();

      const offeringId = selectedService.id ?? selectedService.offering_id;
      const result = await createBooking(barberId, {
        services: [{ id: offeringId, units: 1 }],
        client: {
          fullname,
          email: guestInfo.email || undefined,
          phone_number: guestInfo.phone || undefined,
          contact_id: "",
        },
        date: start.toISOString(),
      });

      // Try to get a payment URL from the booking response or the pay endpoint
      const bookingId = result?.booking?.id;
      let checkoutUrl = result?.checkout_session?.url;

      if (!checkoutUrl && bookingId) {
        try {
          const { data } = await api.get<unknown>(`${API.BOOKING.PAY(bookingId)}`);
          const payRes = data as { url?: string; data?: { url?: string } };
          checkoutUrl = payRes?.url ?? payRes?.data?.url;
        } catch {
          // Payment endpoint may not be available — skip to success
        }
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-8 animate-in zoom-in duration-500 py-12">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
          <ShieldCheck className="w-12 h-12 text-black" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-zinc-50 tracking-tight">Booking Confirmed!</h2>
          <p className="text-zinc-500 font-medium max-w-xs mx-auto text-lg pt-2">
            Your appointment has been successfully scheduled. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
        <button
          onClick={resetBooking}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-50 font-bold hover:bg-white/10 transition-all active:scale-95"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Confirm Booking</h2>
        <p className="text-sm text-zinc-500 font-medium">Review your appointment details</p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-32 h-32" />
        </div>

        <div className="grid sm:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Appointment</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Date</p>
                  <p className="text-zinc-50 font-bold">{selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Clock className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Time</p>
                  <p className="text-zinc-50 font-bold">{selectedTime ? format(parse(selectedTime, "HH:mm", new Date()), "h:mm a") : "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <DollarSign className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Service & Price</p>
                  <p className="text-zinc-50 font-bold">{selectedService?.name} • ${selectedService?.price}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Your Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Name</p>
                  <p className="text-zinc-50 font-bold">{guestInfo.firstName} {guestInfo.lastName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Mail className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Email</p>
                  <p className="text-zinc-50 font-bold">{guestInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Phone className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-0.5">Phone</p>
                  <p className="text-zinc-50 font-bold">{guestInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setStep(3)}
          className="flex items-center justify-center gap-2 py-5 rounded-2xl bg-white/5 text-zinc-300 font-bold border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </button>
        <button
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 py-5 rounded-2xl bg-primary text-black font-black hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
        >
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

function parse(time: string, formatStr: string, baseDate: Date) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}
