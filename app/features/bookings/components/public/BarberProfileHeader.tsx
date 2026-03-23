"use client";

import { Technician } from "@/app/providers/TechnicianProvider";
import { MapPin, Star, Clock } from "lucide-react";
import Image from "next/image";

interface BarberProfileHeaderProps {
  technician: Technician;
}

export default function BarberProfileHeader({ technician }: BarberProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
        <Image
          src={technician.avatar_url || "/default-avatar.png"}
          alt={technician.full_name || "Barber"}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-50 tracking-tight">
          {technician.full_name || technician.nick_name}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-zinc-50 font-bold">4.9</span>
            <span>(120+ reviews)</span>
          </div>
          
          {technician.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span>
                {typeof technician.address === 'object' && 'state' in technician.address 
                  ? `${technician.address.state}, ${technician.address.country}`
                  : "Location unknown"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-zinc-500">
        <div className="flex flex-col items-center gap-1">
          <span className="text-primary">Reliable</span>
          <span className="text-[10px]">Quality</span>
        </div>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-primary">Professional</span>
          <span className="text-[10px]">Service</span>
        </div>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-primary">Fast</span>
          <span className="text-[10px]">Booking</span>
        </div>
      </div>
    </div>
  );
}
