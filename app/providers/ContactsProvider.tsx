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
  fetchContacts,
  createContact,
  uploadContacts,
  deleteContact,
  clearContacts,
} from '@/lib/api/contacts';

interface ContactsContextType {
  contacts: Contact[];
  isLoaded: boolean;
  addContacts: (newContacts: Omit<Contact, 'id'>[]) => Promise<void>;
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

  // Refetch contacts when the logged-in user changes (different account) so we never show the previous user's contacts.
  useEffect(() => {
    if (isDemoMode()) {
      const stored = storage.contacts.get();
      if (stored && stored.length > 0) {
        setContacts(migrateContacts(stored));
      } else {
        setContacts([...SAMPLE_CONTACTS]);
      }
      setIsLoaded(true);
      return;
    }
    if (!user) {
      setContacts([]);
      setIsLoaded(true);
      return;
    }
    let cancelled = false;
    setContacts([]);
    setIsLoaded(false);
    fetchContacts()
      .then((list) => {
        if (!cancelled) setContacts(list);
      })
      .catch(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Save to localStorage in demo mode whenever contacts change
  useEffect(() => {
    if (!isLoaded || !isDemoMode()) return;
    if (contacts.length === 0) {
      storage.contacts.remove();
    } else {
      storage.contacts.set(contacts);
    }
  }, [contacts, isLoaded]);

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
    await clearContacts();
    setContacts([]);
  }, []);

  return (
    <ContactsContext.Provider
      value={{ contacts, isLoaded, addContacts, removeContact, clearAllContacts }}
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
