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
  const [contacts, setContacts] = useState<Contact[]>([...sampleContacts]);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chairfill-contacts');
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading contacts from localStorage:', error);
      }
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chairfill-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addContacts = (newContacts: Omit<Contact, 'id'>[]) => {
    const contactsWithIds = newContacts.map((contact) => ({
      ...contact,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
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
