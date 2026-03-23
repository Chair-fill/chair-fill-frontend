"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Offering } from "@/lib/types/offering";

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PublicBookingContextType {
  step: number;
  setStep: (step: number) => void;
  selectedService: Offering | null;
  setSelectedService: (service: Offering | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  guestInfo: GuestInfo;
  setGuestInfo: (info: GuestInfo) => void;
  resetBooking: () => void;
}

const PublicBookingContext = createContext<PublicBookingContextType | undefined>(undefined);

export function PublicBookingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Offering | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setGuestInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
  };

  return (
    <PublicBookingContext.Provider
      value={{
        step,
        setStep,
        selectedService,
        setSelectedService,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        guestInfo,
        setGuestInfo,
        resetBooking,
      }}
    >
      {children}
    </PublicBookingContext.Provider>
  );
}

export function usePublicBooking() {
  const context = useContext(PublicBookingContext);
  if (context === undefined) {
    throw new Error("usePublicBooking must be used within a PublicBookingProvider");
  }
  return context;
}
