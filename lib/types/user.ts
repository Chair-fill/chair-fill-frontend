export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  role?: string;
  imessageContact?: string | null;
}

export interface UserProfile extends User {
  notifications: NotificationPreferences;
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
  imessageContact?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  /** Optional: backend also accepts firstname, lastname, username, phoneNumber, middlename, referral_code */
  firstname?: string;
  lastname?: string;
  username?: string;
  phoneNumber?: string;
  middlename?: string;
  referral_code?: string;
  imessageContact?: "email" | "phone";
}

export interface AuthResponse {
  user: UserProfile;
  token?: string;
}
