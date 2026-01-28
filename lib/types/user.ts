import type { PaymentMethod, BillingInfo } from "@/lib/types/subscription";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  notifications: NotificationPreferences;
  paymentMethod?: PaymentMethod | null;
  billingInfo?: BillingInfo | null;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdatePaymentRequest {
  paymentMethod: PaymentMethod;
  billingInfo: BillingInfo;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  token?: string;
}
