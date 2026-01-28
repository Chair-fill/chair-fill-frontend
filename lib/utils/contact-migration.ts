import type { Contact } from "@/lib/types/contact";

/**
 * Migrates legacy contact data from organization field to address field
 */
export function migrateContactOrganization(contact: Contact & { organization?: string }): Contact {
  const { organization, ...rest } = contact;
  const migrated: Contact = { ...rest };
  
  if (typeof migrated.address !== 'string' && typeof organization === 'string' && organization) {
    migrated.address = organization;
  }
  
  return migrated;
}

/**
 * Migrates an array of contacts, handling legacy organization field
 */
export function migrateContacts(contacts: (Contact & { organization?: string })[]): Contact[] {
  return contacts.map(migrateContactOrganization);
}
