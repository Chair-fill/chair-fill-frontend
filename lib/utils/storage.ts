import { STORAGE_KEYS } from "@/lib/constants/contacts";
import type { Contact } from "@/lib/types/contact";
import type { Subscription } from "@/lib/types/subscription";

export const storage = {
  contacts: {
    get: (): Contact[] | null => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading contacts from storage:', error);
        return null;
      }
    },
    set: (contacts: Contact[]): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      } catch (error) {
        console.error('Error saving contacts to storage:', error);
      }
    },
    remove: (): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    },
  },
  subscription: {
    get: (): Subscription | null => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading subscription from storage:', error);
        return null;
      }
    },
    set: (subscription: Subscription): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
      } catch (error) {
        console.error('Error saving subscription to storage:', error);
      }
    },
  },
};
