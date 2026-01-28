'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserProfile, UpdateProfileRequest, UpdatePaymentRequest, NotificationPreferences, LoginRequest, SignupRequest } from '@/lib/types/user';
import { STORAGE_KEY_USER, DEFAULT_USER } from '@/lib/constants/user';
import { getToken, removeToken, setToken } from '@/lib/auth';
import { api, setUnauthorizedHandler } from '@/lib/api-client';
import { isDemoMode, setDemoMode } from '@/lib/demo';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithDemo: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePaymentDetails: (data: UpdatePaymentRequest) => Promise<void>;
  updateNotifications: (prefs: NotificationPreferences) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    setDemoMode(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    setUser(null);
  }, []);

  const loginWithDemo = useCallback(() => {
    setDemoMode(true);
    setUser(DEFAULT_USER);
  }, []);

  // Register 401 handler so API client can clear session when token is invalid
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  // Restore session on mount: if demo mode and no token, set user from storage or DEFAULT_USER; else if token, fetch /auth/me
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsAuthLoading(false);
      return;
    }
    const token = getToken();
    if (isDemoMode() && !token) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        setUser(stored ? (JSON.parse(stored) as UserProfile) : DEFAULT_USER);
      } catch {
        setUser(DEFAULT_USER);
      }
      setIsAuthLoading(false);
      return;
    }
    if (!token) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
      setIsAuthLoading(false);
      return;
    }
    api
      .get<{ user: UserProfile }>('/auth/me')
      .then(({ data }) => {
        const profile = data?.user ?? data;
        if (profile && typeof profile === 'object' && profile.id) {
          setUser(profile as UserProfile);
        }
      })
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }, [user]);

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (user) {
        setUser({
          ...user,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentDetails = async (data: UpdatePaymentRequest) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (user) {
        setUser({
          ...user,
          paymentMethod: data.paymentMethod,
          billingInfo: data.billingInfo,
        });
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotifications = async (prefs: NotificationPreferences) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (user) {
        setUser({
          ...user,
          notifications: prefs,
        });
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    if (isDemoMode()) {
      setUser({ ...DEFAULT_USER, email: credentials.email, name: credentials.email.split('@')[0] || 'Demo User' });
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post<{ user: UserProfile; token?: string }>('/auth/login', credentials);
      const profile = data.user ?? data;
      const token = (data as { token?: string }).token;
      if (token) setToken(token);
      setUser(profile as UserProfile);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    if (isDemoMode()) {
      setUser({
        ...DEFAULT_USER,
        email: data.email,
        name: data.name || data.email.split('@')[0] || 'Demo User',
      });
      return;
    }
    setIsLoading(true);
    try {
      const { data: res } = await api.post<{ user: UserProfile; token?: string }>('/auth/signup', data);
      const profile = res.user ?? res;
      const token = (res as { token?: string }).token;
      if (token) setToken(token);
      setUser(profile as UserProfile);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthLoading,
        login,
        signup,
        loginWithDemo,
        updateProfile,
        updatePaymentDetails,
        updateNotifications,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
