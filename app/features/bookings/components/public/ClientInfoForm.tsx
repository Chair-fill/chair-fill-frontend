"use client";

import { usePublicBooking } from "@/app/providers/PublicBookingProvider";
import { User, Mail, Phone, ArrowRight } from "lucide-react";

export default function ClientInfoForm() {
  const { guestInfo, setGuestInfo, setStep } = usePublicBooking();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo({ ...guestInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestInfo.firstName && guestInfo.lastName && guestInfo.email && guestInfo.phone) {
      setStep(4);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">Your Information</h2>
        <p className="text-sm text-zinc-500 font-medium">Almost there! Fill in your details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">First Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input
                required
                name="firstName"
                value={guestInfo.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Last Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <input
                required
                name="lastName"
                value={guestInfo.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input
              required
              type="email"
              name="email"
              value={guestInfo.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input
              required
              type="tel"
              name="phone"
              value={guestInfo.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-50 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-4 group"
        >
          <span>Continue to Confirmation</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
