'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Contact } from '@/lib/types/contact';
import { SAMPLE_CONTACTS } from '@/lib/constants/contacts';
import { storage } from '@/lib/utils/storage';
import { migrateContacts } from '@/lib/utils/contact-migration';
import { generateContactId } from '@/lib/utils/id-generator';

interface ContactsContextType {
  contacts: Contact[];
  addContacts: (newContacts: Omit<Contact, 'id'>[]) => void;
  removeContact: (id: string) => void;
  clearAllContacts: () => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  // Initialize state - check localStorage first, fallback to sample contacts
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const stored = storage.contacts.get();
    if (stored && stored.length > 0) {
      return migrateContacts(stored);
    }
    return [...SAMPLE_CONTACTS];
  });

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    storage.contacts.set(contacts);
  }, [contacts]);

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
      value={{ contacts, addContacts, removeContact, clearAllContacts }}
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
