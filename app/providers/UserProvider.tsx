'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile, UpdateProfileRequest, NotificationPreferences } from '@/lib/types/user';
import { STORAGE_KEY_USER, DEFAULT_USER } from '@/lib/constants/user';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateNotifications: (prefs: NotificationPreferences) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Set default user for demo purposes
        setUser(DEFAULT_USER);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USER));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setUser(DEFAULT_USER);
    }
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

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        updateProfile,
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
