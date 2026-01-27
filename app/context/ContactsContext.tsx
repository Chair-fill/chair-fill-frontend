'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  [key: string]: string | undefined;
}


const sampleContacts:Contact[] = [
  {id:"1", email: "", name: "Mahmud Suberu", phone: "+2349034780718"}
]


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
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chairfill-contacts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only use stored contacts if they exist and have items
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (error) {
          console.error('Error loading contacts from localStorage:', error);
        }
      }
    }
    // Return sample contacts if localStorage is empty or invalid
    return [...sampleContacts];
  });

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chairfill-contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const addContacts = (newContacts: Omit<Contact, 'id'>[]) => {
    const contactsWithIds: Contact[] = newContacts.map((contact): Contact => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newContact: Contact = {
        id,
        name: contact.name ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
      };
      if (contact.organization) {
        newContact.organization = contact.organization;
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
    localStorage.removeItem('chairfill-contacts');
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
