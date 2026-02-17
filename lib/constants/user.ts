import type { UserProfile } from "@/lib/types/user";

export const STORAGE_KEY_USER = "chairfill-user";

/** Default outreach message (localStorage until backend supports it). */
export const STORAGE_KEY_DEFAULT_OUTREACH_MESSAGE = "chairfill-default-outreach-message";

export const DEFAULT_USER: UserProfile = {
  id: "user-1",
  name: "McArthur Terell",
  email: "mcarthurterell@example.com",
  phone: "",
  address: "",
  avatar: "",
  createdAt: new Date().toISOString(),
  notifications: {
    email: true,
    sms: false,
    marketing: false,
    allowAutomatedOutreachOnBulkUpload: false,
  },
  imessageContact: "",
  defaultOutreachMessage: "",
};
