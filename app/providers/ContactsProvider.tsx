'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Contact } from '@/lib/types/contact';
import { SAMPLE_CONTACTS } from '@/lib/constants/contacts';
import { storage } from '@/lib/utils/storage';
import { migrateContacts } from '@/lib/utils/contact-migration';
import { generateContactId } from '@/lib/utils/id-generator';
import { isDemoMode } from '@/lib/demo';
import { useUser } from '@/app/providers/UserProvider';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import {
  fetchContactList,
  createContact,
  uploadContacts,
  uploadContactsBulkFile,
  deleteContact,
  clearContacts,
} from '@/lib/api/contacts';

const DEFAULT_PAGE_SIZE = 10;

export interface ContactListFilters {
  phone_number?: string;
  first_name?: string;
  from?: string;
  to?: string;
}

interface ContactsContextType {
  contacts: Contact[];
  isLoaded: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  pageSize: number;
  setPageSize: (size: number) => void;
  loadMore: () => Promise<void>;
  filters: ContactListFilters;
  setFilters: (filters: ContactListFilters) => void;
  addContacts: (newContacts: Omit<Contact, 'id'>[]) => Promise<void>;
  uploadBulkFile: (file: File) => Promise<void>;
  refetchContactList: () => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  clearAllContacts: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { technician } = useTechnician();
  const technicianId = technician?.id ?? technician?.technician_id;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFiltersState] = useState<ContactListFilters>({});

  const setPageSize = useCallback((size: number) => {
    setPageSizeState((prev) => (size >= 1 ? size : prev));
    setNextCursor(undefined);
  }, []);
  const setFilters = useCallback((f: ContactListFilters) => {
    setFiltersState(f);
    setNextCursor(undefined);
  }, []);

  // Fetch first page when user, pageSize, or filters change: GET /contact/list?user_id=...&page_size=...&...
  useEffect(() => {
    if (isDemoMode()) {
      const stored = storage.contacts.get();
      if (stored && stored.length > 0) {
        setContacts(migrateContacts(stored));
      } else {
        setContacts([...SAMPLE_CONTACTS]);
      }
      setHasMore(false);
      setIsLoaded(true);
      return;
    }
    if (!user?.id) {
      setContacts([]);
      setHasMore(false);
      setNextCursor(undefined);
      setIsLoaded(true);
      return;
    }
    let cancelled = false;
    setIsLoaded(false);
    setNextCursor(undefined);
    fetchContactList({
      user_id: user.id,
      page_size: pageSize,
      ...(filters.phone_number != null && filters.phone_number !== '' && { phone_number: filters.phone_number }),
      ...(filters.first_name != null && filters.first_name !== '' && { first_name: filters.first_name }),
      ...(filters.from != null && filters.from !== '' && { from: filters.from }),
      ...(filters.to != null && filters.to !== '' && { to: filters.to }),
    })
      .then((result) => {
        if (!cancelled) {
          setContacts(result.contacts);
          setHasMore(!!result.next_cursor);
          setNextCursor(result.next_cursor);
        }
      })
      .catch(() => {
        if (!cancelled) setContacts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, pageSize, filters.phone_number, filters.first_name, filters.from, filters.to]);

  const loadMore = useCallback(async () => {
    if (isDemoMode() || !user?.id || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await fetchContactList({
        user_id: user.id,
        page_size: pageSize,
        cursor: nextCursor,
        ...(filters.phone_number != null && filters.phone_number !== '' && { phone_number: filters.phone_number }),
        ...(filters.first_name != null && filters.first_name !== '' && { first_name: filters.first_name }),
        ...(filters.from != null && filters.from !== '' && { from: filters.from }),
        ...(filters.to != null && filters.to !== '' && { to: filters.to }),
      });
      setContacts((prev) => [...prev, ...result.contacts]);
      setHasMore(!!result.next_cursor);
      setNextCursor(result.next_cursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user?.id, pageSize, nextCursor, isLoadingMore, filters.phone_number, filters.first_name, filters.from, filters.to]);

  // Save to localStorage in demo mode whenever contacts change
  useEffect(() => {
    if (!isLoaded || !isDemoMode()) return;
    if (contacts.length === 0) {
      storage.contacts.remove();
    } else {
      storage.contacts.set(contacts);
    }
  }, [contacts, isLoaded]);

  const refetchContactList = useCallback(async () => {
    if (isDemoMode() || !user?.id) return;
    setNextCursor(undefined);
    const result = await fetchContactList({
      user_id: user.id,
      page_size: pageSize,
      ...(filters.phone_number != null && filters.phone_number !== '' && { phone_number: filters.phone_number }),
      ...(filters.first_name != null && filters.first_name !== '' && { first_name: filters.first_name }),
      ...(filters.from != null && filters.from !== '' && { from: filters.from }),
      ...(filters.to != null && filters.to !== '' && { to: filters.to }),
    });
    setContacts(result.contacts);
    setHasMore(!!result.next_cursor);
    setNextCursor(result.next_cursor);
  }, [user?.id, pageSize, filters.phone_number, filters.first_name, filters.from, filters.to]);

  const addContacts = useCallback(
    async (newContacts: Omit<Contact, 'id'>[]) => {
      if (isDemoMode()) {
        const contactsWithIds: Contact[] = newContacts.map((contact): Contact => {
          const id = generateContactId();
          const newContact: Contact = {
            id,
            name: contact.name ?? '',
            email: contact.email ?? '',
            phone: contact.phone ?? '',
          };
          if (contact.address) newContact.address = contact.address;
          return newContact;
        });
        setContacts((prev) => [...prev, ...contactsWithIds]);
        return;
      }
      if (newContacts.length === 1) {
        const payload = {
          name: newContacts[0].name ?? '',
          email: newContacts[0].email ?? '',
          phone: newContacts[0].phone ?? '',
          ...(newContacts[0].address && { address: newContacts[0].address }),
        };
        const created = await createContact(payload, technicianId ?? undefined);
        setContacts((prev) => [...prev, created]);
        return;
      }
      if (technicianId == null) return;
      const payload = newContacts.map((c) => ({
        name: c.name ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        ...(c.address && { address: c.address }),
      }));
      const created = await uploadContacts(payload, technicianId);
      setContacts((prev) => [...prev, ...created]);
    },
    [technicianId]
  );

  const uploadBulkFile = useCallback(
    async (file: File) => {
      if (isDemoMode()) {
        const text = await file.text();
        const { parseCSV, parseVCF } = await import('@/lib/utils/contact-parser');
        const parsed =
          file.name.endsWith('.csv') ? parseCSV(text) : file.name.endsWith('.vcf') ? parseVCF(text) : [];
        if (parsed.length > 0) {
          const contactsWithIds: Contact[] = parsed.map((c) => ({
            id: generateContactId(),
            name: c.name ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
          }));
          setContacts((prev) => [...prev, ...contactsWithIds]);
        }
        return;
      }
      if (technicianId == null || technicianId === '') {
        throw new Error('Barber profile is required to upload contacts. Complete Barber info in Account Settings.');
      }
      await uploadContactsBulkFile(file, technicianId);
      await refetchContactList();
    },
    [technicianId, refetchContactList]
  );

  const removeContact = useCallback(
    async (id: string) => {
      if (isDemoMode()) {
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
        return;
      }
      try {
        await deleteContact(id);
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
      } catch (err) {
        console.error('Failed to delete contact:', err);
        throw err;
      }
    },
    []
  );

  const clearAllContacts = useCallback(async () => {
    if (isDemoMode()) {
      setContacts([]);
      storage.contacts.remove();
      return;
    }
    if (user?.id) await clearContacts(user.id);
    setContacts([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, [user?.id]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        isLoaded,
        hasMore,
        isLoadingMore,
        pageSize,
        setPageSize,
        loadMore,
        filters,
        setFilters,
        addContacts,
        uploadBulkFile,
        refetchContactList,
        removeContact,
        clearAllContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
