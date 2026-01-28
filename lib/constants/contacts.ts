import type { Contact } from "@/lib/types/contact";

export const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', email: '', name: 'Mahmud Suberu', phone: '+2349034780718' }
];

export const STORAGE_KEYS = {
  CONTACTS: 'chairfill-contacts',
  SUBSCRIPTION: 'chairfill-subscription',
} as const;
