"use client";

import { Technician } from "@/app/providers/TechnicianProvider";
import { MapPin, User } from "lucide-react";
import Image from "next/image";

interface BarberProfileHeaderProps {
  technician: Technician;
}

export default function BarberProfileHeader({ technician }: BarberProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
        {technician.avatar_url ? (
          <Image
            src={technician.avatar_url}
            alt={technician.full_name || "Barber"}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <User className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-500" />
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-50 tracking-tight">
          {technician.full_name || technician.nick_name}
        </h1>
        
        {technician.address && (
          <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-400">
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
  );
}
