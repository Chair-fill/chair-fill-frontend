'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getToken } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';
import { useUser } from '@/app/providers/UserProvider';

/** Timeline event from GET /progress/me */
export interface ProgressTimelineEvent {
  name: string;
  description: string;
  date_created: string;
  data: Record<string, unknown> | null;
}

/** Owner info from GET /progress/me */
export interface ProgressOwner {
  user_id: string;
  email?: string;
  phone_number?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  [key: string]: unknown;
}

/** Shape of GET /progress/me response data */
export interface Progress {
  id?: string;
  created_at?: string;
  updated_at?: string;
  has_subscribed: boolean;
  is_technician: boolean;
  timeline?: ProgressTimelineEvent[];
  owner?: ProgressOwner;
  [key: string]: unknown;
}

/** Raw API response (NestJS wraps in data) */
interface ProgressApiResponse {
  data?: Progress;
}

interface ProgressContextType {
  progress: Progress | null;
  isProgressLoading: boolean;
  refetchProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  const refetchProgress = useCallback(async () => {
    if (isDemoMode()) {
      setProgress({
        has_subscribed: true,
        is_technician: true,
      });
      setIsProgressLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setProgress(null);
      setIsProgressLoading(false);
      return;
    }
    setIsProgressLoading(true);
    try {
      const { data } = await api.get<Progress | ProgressApiResponse>(API.PROGRESS.ME);
      const raw = data as ProgressApiResponse;
      const prog = (raw?.data ?? data) as Progress | undefined;
      setProgress(prog && typeof prog === 'object' ? prog : null);
    } catch {
      setProgress(null);
    } finally {
      setIsProgressLoading(false);
    }
  }, []);

  // Refetch progress whenever the logged-in user changes (login/logout/switch) so we never show stale progress from a previous session.
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsProgressLoading(false);
      return;
    }
    if (!user) {
      setProgress(null);
      setIsProgressLoading(false);
      return;
    }
    if (isDemoMode()) {
      setProgress({
        has_subscribed: true,
        is_technician: true,
      });
      setIsProgressLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setProgress(null);
      setIsProgressLoading(false);
      return;
    }
    refetchProgress();
  }, [user?.id, refetchProgress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isProgressLoading,
        refetchProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
