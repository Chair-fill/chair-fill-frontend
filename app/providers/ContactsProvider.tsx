'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Contact } from '@/lib/types/contact';
import { SAMPLE_CONTACTS } from '@/lib/constants/contacts';
import { storage } from '@/lib/utils/storage';
import { migrateContacts } from '@/lib/utils/contact-migration';
import { generateContactId } from '@/lib/utils/id-generator';

interface ContactsContextType {
  contacts: Contact[];
  isLoaded: boolean;
  addContacts: (newContacts: Omit<Contact, 'id'>[]) => void;
  removeContact: (id: string) => void;
  clearAllContacts: () => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load contacts from localStorage on mount (client-only)
  useEffect(() => {
    const stored = storage.contacts.get();
    if (stored && stored.length > 0) {
      setContacts(migrateContacts(stored));
    } else {
      setContacts([...SAMPLE_CONTACTS]);
    }
    setIsLoaded(true);
  }, []);

  // Save contacts to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    if (contacts.length === 0) {
      storage.contacts.remove();
    } else {
      storage.contacts.set(contacts);
    }
  }, [contacts, isLoaded]);

  const addContacts = (newContacts: Omit<Contact, 'id'>[]) => {
    const contactsWithIds: Contact[] = newContacts.map((contact): Contact => {
      const id = generateContactId();
      const newContact: Contact = {
        id,
        name: contact.name ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
      };
      if (contact.address) {
        newContact.address = contact.address;
      }
      return newContact;
    });
    setContacts((prev) => [...prev, ...contactsWithIds]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const clearAllContacts = () => {
    setContacts([]);
    storage.contacts.remove();
  };

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
