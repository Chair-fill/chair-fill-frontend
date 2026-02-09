'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserProfile, UpdateProfileRequest, NotificationPreferences, SignupRequest } from '@/lib/types/user';
import { STORAGE_KEY_USER, DEFAULT_USER } from '@/lib/constants/user';
import { getToken, removeToken, setToken } from '@/lib/auth';
import { api, setUnauthorizedHandler, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { isDemoMode, setDemoMode } from '@/lib/demo';
import type { ChangePasswordRequest } from '@/lib/types/user';

/** Step 1 of sign-in: verify password, returns verifyToken if OTP needed */
export interface SigninVerifyResult {
  needsOtp: boolean;
  verifyToken?: string;
}

/** Location payload for PUT /user/location (address, city, state, country) */
export interface SetLocationRequest {
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  /** Step 1: Verify credentials; returns { needsOtp, verifyToken } or completes if backend returns user+token directly */
  signinVerify: (email: string, password: string) => Promise<SigninVerifyResult>;
  /** Step 2: Complete sign-in with OTP */
  signinWithOtp: (email: string, verifyToken: string, otp: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithDemo: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  setLocation: (data: SetLocationRequest) => Promise<void>;
  updatePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string | void>;
  removeProfilePicture: () => Promise<void>;
  updateNotifications: (prefs: NotificationPreferences) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function splitName(name: string): { firstname: string; lastname: string } {
  const trimmed = name.trim();
  const space = trimmed.indexOf(' ');
  if (space <= 0) return { firstname: trimmed || 'User', lastname: '' };
  return { firstname: trimmed.slice(0, space), lastname: trimmed.slice(space + 1) };
}

/** Map backend user payload to our UserProfile (handles firstname/lastname, phone_number, etc.) */
function mapBackendUserToProfile(backend: Record<string, unknown> | UserProfile): UserProfile {
  const b = backend as Record<string, unknown>;
  const first = (b.firstname as string) ?? '';
  const last = (b.lastname as string) ?? '';
  const name = [first, last].filter(Boolean).join(' ') || (b.username as string) || (b.email as string) || 'User';
  const imessage = (b.imessageContact as string) ?? (b.imessage_contact as string) ?? null;
  return {
    id: String(b.id ?? b.user_id ?? ''),
    name,
    email: String(b.email ?? ''),
    phone: String(b.phone_number ?? b.phone ?? ''),
    address: String(b.address ?? ''),
    avatar: b.avatar != null ? String(b.avatar) : undefined,
    createdAt: String(b.createdAt ?? b.created_at ?? new Date().toISOString()),
    role: b.role != null ? String(b.role) : undefined,
    notifications: (b.notifications as UserProfile['notifications']) ?? {
      email: true,
      sms: false,
      marketing: false,
    },
    imessageContact: imessage ?? null,
  };
}

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
      .get<{ user?: UserProfile } | UserProfile>(API.USER.CURRENT)
      .then(({ data }) => {
        const profile = (data && typeof data === 'object' && 'user' in data ? (data as { user?: UserProfile }).user : data) as UserProfile | undefined;
        if (profile && typeof profile === 'object' && profile.id) {
          setUser(mapBackendUserToProfile(profile));
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
    if (isDemoMode()) {
      if (user) setUser({ ...user, ...data });
      return;
    }
    setIsLoading(true);
    try {
      // Backend PUT /user/profile accepts optional username; map our fields
      const body: Record<string, string> = {};
      if (data.name != null) body.username = data.name;
      if (data.email != null) body.email = data.email;
      if (data.phone != null) body.phone_number = data.phone;
      if (data.address != null) body.address = data.address;
      if (data.imessageContact) {
        body.imessageContact = data.imessageContact;
        body.imessage_contact = data.imessageContact;
      }
      if (Object.keys(body).length > 0) {
        await api.put(API.USER.PROFILE, body);
      }
      if (user) setUser({ ...user, ...data });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setLocation = async (data: SetLocationRequest) => {
    if (isDemoMode()) {
      if (user) setUser({ ...user, address: data.address });
      return;
    }
    setIsLoading(true);
    try {
      await api.put(API.USER.LOCATION, {
        address: data.address,
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.country && { country: data.country }),
      });
      if (user) setUser({ ...user, address: data.address });
    } catch (error) {
      console.error('Error setting location:', error);
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

  const updatePassword = async (data: ChangePasswordRequest) => {
    if (isDemoMode()) return;
    setIsLoading(true);
    try {
      await api.post(API.AUTH.PASSWORD_UPDATE, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | void> => {
    if (isDemoMode()) {
      if (user) setUser({ ...user, avatar: URL.createObjectURL(file) });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url?: string; avatar?: string }>(API.USER.PICTURE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.url ?? data?.avatar;
      if (url && user) setUser({ ...user, avatar: url });
      return typeof url === 'string' ? url : undefined;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (isDemoMode()) {
      if (user) setUser({ ...user, avatar: undefined });
      return;
    }
    setIsLoading(true);
    try {
      await api.delete(API.USER.PICTURE_REMOVE);
      if (user) setUser({ ...user, avatar: undefined });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signinVerify = async (email: string, password: string): Promise<SigninVerifyResult> => {
    if (isDemoMode()) {
      setUser({ ...DEFAULT_USER, email, name: email.split('@')[0] || 'Demo User' });
      return { needsOtp: false };
    }
    setIsLoading(true);
    try {
      const { data } = await api.post<{ user?: UserProfile; token?: string }>(API.AUTH.SIGNIN, {
        field: email,
        password,
      });
      const profile = (data as { user?: UserProfile }).user ?? data;
      const token = (data as { token?: string }).token;
      if (profile && typeof profile === 'object' && token) {
        setToken(token);
        setUser(mapBackendUserToProfile(profile as UserProfile));
        return { needsOtp: false };
      }
      if (token) return { needsOtp: true, verifyToken: token };
      return { needsOtp: true, verifyToken: '' };
    } catch (error) {
      console.error('Signin verify error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signinWithOtp = async (email: string, verifyToken: string, otp: string) => {
    if (isDemoMode()) return;
    setIsLoading(true);
    try {
      const { data } = await api.post<{ user?: UserProfile; token?: string }>(API.AUTH.SIGNIN, {
        field: email,
        token: verifyToken,
        otp,
      });
      const profile = (data as { user?: UserProfile }).user ?? data;
      const token = (data as { token?: string }).token;
      if (token) setToken(token);
      if (profile && typeof profile === 'object') setUser(mapBackendUserToProfile(profile as UserProfile));
    } catch (error) {
      console.error('Signin OTP error:', error);
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
      const parts = (data.firstname != null && data.lastname != null)
        ? { firstname: data.firstname, lastname: data.lastname }
        : splitName(data.name);
      const body = {
        email: data.email,
        password: data.password,
        firstname: parts.firstname,
        lastname: parts.lastname,
        ...(data.username && { username: data.username }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.middlename != null && { middlename: data.middlename }),
        ...(data.referral_code != null && { referral_code: data.referral_code }),
        ...(data.imessageContact && {
          imessageContact: data.imessageContact,
          imessage_contact: data.imessageContact,
        }),
      };
      const { data: res } = await api.post<{ user?: UserProfile; token?: string }>(API.AUTH.SIGNUP, body);
      const profile = res?.user ?? res;
      const token = (res as { token?: string })?.token;
      if (token) setToken(token);
      if (profile && typeof profile === 'object') setUser(mapBackendUserToProfile(profile as UserProfile));
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
        signinVerify,
        signinWithOtp,
        signup,
        loginWithDemo,
        updateProfile,
        setLocation,
        updatePassword,
        uploadProfilePicture,
        removeProfilePicture,
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
