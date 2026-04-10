"use client";

import { Offering } from "@/lib/types/offering";
import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { Check, Clock, ChevronRight } from "lucide-react";

interface ServiceSelectionProps {
  offerings: Offering[];
}

export default function ServiceSelection({ offerings }: ServiceSelectionProps) {
  const { selectedService, setSelectedService, setStep } = usePublicBooking();

  const handleSelect = (offering: Offering) => {
    setSelectedService(offering);
    setStep(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Select a Service</h2>
        <p className="text-sm text-zinc-500 font-medium">Choose from our available offerings</p>
      </div>

      <div className="grid gap-4">
        {[...offerings].sort((a, b) => Number(a.price) - Number(b.price)).map((offering) => (
          <button
            key={offering.id}
            onClick={() => handleSelect(offering)}
            className={`group relative flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 text-left ${
              selectedService?.id === offering.id
                ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-zinc-50 group-hover:text-primary transition-colors">
                  {offering.name}
                </span>
                {offering.promo && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                    Promo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{offering.duration} min</span>
                </div>
                <span>•</span>
                <span className="text-zinc-300">${offering.price}</span>
              </div>
              {offering.description && (
                <p className="text-xs text-zinc-500 line-clamp-1 max-w-sm mt-1">
                  {offering.description}
                </p>
              )}
            </div>

            <div className={`p-2 rounded-full transition-all duration-300 ${
              selectedService?.id === offering.id
                ? "bg-primary text-black scale-110"
                : "bg-white/5 text-zinc-500 group-hover:text-zinc-50 group-hover:bg-white/10"
            }`}>
              {selectedService?.id === offering.id ? (
                <Check className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {offerings.length === 0 && (
        <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
          <p className="text-zinc-500 font-medium">No services currently available.</p>
        </div>
      )}
    </div>
  );
}
