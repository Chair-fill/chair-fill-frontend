'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getToken } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';

/** Minimal technician shape - backend may return more */
export interface Technician {
  id?: string;
  technician_id?: string;
  full_name?: string;
  nick_name?: string;
  email?: string;
  phone_number?: string;
  address?: Record<string, unknown> | TechnicianAddress;
  [key: string]: unknown;
}

/** Address for technician (barber onboarding) */
export interface TechnicianAddress {
  street: string;
  country: string;
  state: string;
}

/** Payload for POST /technician/lite (Create Technician) */
export interface CreateTechnicianRequest {
  contact_via_socials?: boolean;
  nick_name?: string;
  address: TechnicianAddress;
}

/** Payload for updating technician (e.g. PUT /technician/me) */
export interface UpdateTechnicianRequest {
  nick_name?: string;
  address?: TechnicianAddress;
}

interface TechnicianContextType {
  technician: Technician | null;
  isTechnicianLoading: boolean;
  refetchTechnician: () => Promise<void>;
  createTechnician: (data: CreateTechnicianRequest) => Promise<void>;
  updateTechnician: (data: UpdateTechnicianRequest) => Promise<void>;
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

export function TechnicianProvider({ children }: { children: ReactNode }) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isTechnicianLoading, setIsTechnicianLoading] = useState(true);

  const refetchTechnician = useCallback(async () => {
    if (isDemoMode()) {
      setTechnician({ id: 'demo-technician', full_name: 'Demo Barber' });
      setIsTechnicianLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setTechnician(null);
      setIsTechnicianLoading(false);
      return;
    }
    setIsTechnicianLoading(true);
    try {
      const { data } = await api.get<Technician | { technician?: Technician; data?: Technician }>(API.TECHNICIAN.ME);
      const raw = data as { technician?: Technician; data?: Technician } | Technician;
      const tech = (raw && typeof raw === 'object' && 'technician' in raw
        ? (raw as { technician?: Technician }).technician
        : (raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: Technician }).data
          : raw)) as Technician | undefined;
      if (tech && typeof tech === 'object') {
        const id = tech.id ?? tech.technician_id ?? (tech as { _id?: string })._id;
        setTechnician({ ...tech, id: id ?? tech.id, technician_id: tech.technician_id ?? id });
      } else {
        setTechnician(null);
      }
    } catch {
      setTechnician(null);
    } finally {
      setIsTechnicianLoading(false);
    }
  }, []);

  const createTechnician = useCallback(async (data: CreateTechnicianRequest) => {
    if (isDemoMode()) {
      setTechnician({ id: 'demo-technician', full_name: data.nick_name ?? 'Demo Barber' });
      return;
    }
    const payload = {
      contact_via_socials: true,
      ...(data.nick_name?.trim() && { nick_name: data.nick_name.trim() }),
      address: {
        street: data.address.street,
        country: data.address.country,
        state: data.address.state,
      },
    };
    await api.post(API.TECHNICIAN.LITE, payload);
    await refetchTechnician();
  }, [refetchTechnician]);

  const updateTechnician = useCallback(async (data: UpdateTechnicianRequest) => {
    if (isDemoMode()) {
      if (technician) {
        setTechnician({
          ...technician,
          ...(data.nick_name !== undefined && { full_name: data.nick_name || technician.full_name }),
          ...(data.address && { address: data.address }),
        });
      }
      return;
    }
    const body: Record<string, unknown> = {};
    if (data.nick_name !== undefined) body.nick_name = data.nick_name;
    if (data.address) body.address = data.address;
    if (Object.keys(body).length === 0) return;
    await api.put(API.TECHNICIAN.ME, body);
    await refetchTechnician();
  }, [refetchTechnician, technician]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsTechnicianLoading(false);
      return;
    }
    if (isDemoMode()) {
      setTechnician({ id: 'demo-technician', full_name: 'Demo Barber' });
      setIsTechnicianLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setTechnician(null);
      setIsTechnicianLoading(false);
      return;
    }
    refetchTechnician();
  }, [refetchTechnician]);

  return (
    <TechnicianContext.Provider
      value={{
        technician,
        isTechnicianLoading,
        refetchTechnician,
        createTechnician,
        updateTechnician,
      }}
    >
      {children}
    </TechnicianContext.Provider>
  );
}

export function useTechnician() {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnician must be used within a TechnicianProvider');
  }
  return context;
}
