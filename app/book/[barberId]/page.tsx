"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { API } from "@/lib/constants/api";
import { Technician } from "@/app/providers/TechnicianProvider";
import { Offering } from "@/lib/types/offering";
import PageLoader from "@/app/components/ui/PageLoader";
import { PublicBookingProvider, usePublicBooking } from "@/app/providers/PublicBookingProvider";
import BarberProfileHeader from "@/app/features/bookings/components/public/BarberProfileHeader";
import ServiceSelection from "@/app/features/bookings/components/public/ServiceSelection";
import ClientCalendar from "@/app/features/bookings/components/public/ClientCalendar";
import TimeSelection from "@/app/features/bookings/components/public/TimeSelection";
import ClientInfoForm from "@/app/features/bookings/components/public/ClientInfoForm";
import BookingSummary from "@/app/features/bookings/components/public/BookingSummary";
import { ChevronLeft } from "lucide-react";
import { isDemoMode } from "@/lib/demo";

function BookingFlow({ technician, offerings }: { technician: Technician, offerings: Offering[] }) {
  const { step, setStep } = usePublicBooking();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 pb-32">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}
        
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <BarberProfileHeader technician={technician} />

      <div className="min-h-[400px]">
        {step === 1 && <ServiceSelection offerings={offerings} />}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Pick a Date</h2>
              <p className="text-sm text-zinc-500 font-medium">When would you like to come in?</p>
            </div>
            <div className="grid lg:grid-cols-[1fr,360px] gap-8 items-start">
              <ClientCalendar 
                availability={technician.availability} 
                blockedDates={technician.blocked_dates} 
              />
              <TimeSelection availability={technician.availability} />
            </div>
          </div>
        )}
        {step === 3 && <ClientInfoForm />}
        {step === 4 && <BookingSummary />}
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  const params = useParams();
  const barberId = params.barberId as string;
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (barberId === 'barber-id' || isDemoMode()) {
        // Mock data for previewing when backend isn't ready
        setTechnician({
          id: 'barber-id',
          full_name: 'Alex "The Blade" Sterling',
          nick_name: 'Alex Sterling',
          avatar_url: 'https://images.unsplash.com/photo-1503910368127-b442091450a6?w=400&h=400&fit=crop',
          address: {
            street: '123 Fade Street',
            state: 'California',
            country: 'USA'
          },
          availability: {
            monday: { isOpen: true, from: '09:00', to: '18:00' },
            tuesday: { isOpen: true, from: '09:00', to: '18:00' },
            wednesday: { isOpen: true, from: '09:00', to: '18:00' },
            thursday: { isOpen: true, from: '09:00', to: '20:00' },
            friday: { isOpen: true, from: '09:00', to: '21:00' },
            saturday: { isOpen: true, from: '10:00', to: '16:00' },
            sunday: { isOpen: false, from: '00:00', to: '00:00' }
          },
          blocked_dates: []
        });
        setOfferings([
          { id: '1', offering_id: 'off-1', name: 'Signature Haircut', price: 45, duration: 45, description: 'Precision cut with hot towel finish.', promo: true },
          { id: '2', offering_id: 'off-2', name: 'Beard Grooming', price: 25, duration: 30, description: 'Sculpting and conditioning.' },
          { id: '3', offering_id: 'off-3', name: 'The Full Service', price: 60, duration: 75, description: 'Haircut + Beard treatment + Facial.' }
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const [techRes, offeringsRes] = await Promise.all([
          api.get(API.TECHNICIAN.GET_PUBLIC(barberId)),
          api.get(`${API.OFFERINGS.LIST}?technician_id=${barberId}`)
        ]);

        // Handle NestJS data wrapper if present
        const techData = techRes.data.data || techRes.data;
        const offeringsData = offeringsRes.data.data || offeringsRes.data;

        setTechnician(techData);
        setOfferings(offeringsData);
      } catch (err) {
        console.error("Booking page error:", err);
        setError("Could not load barber profile. Please check the link and try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (barberId) {
      fetchData();
    }
  }, [barberId]);

  if (isLoading) return <PageLoader />;
  
  if (error || !technician) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <span className="text-3xl text-red-500 font-bold">!</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">{error || "Barber not found"}</h1>
          <p className="text-zinc-500">The link you followed may be incorrect or the profile is temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30">
      <PublicBookingProvider>
        <BookingFlow technician={technician} offerings={offerings} />
      </PublicBookingProvider>
    </div>
  );
}
