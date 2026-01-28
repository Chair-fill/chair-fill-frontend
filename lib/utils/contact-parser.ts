import type { ParsedContact } from "@/lib/types/contact";

/**
 * Parses CSV content and extracts contacts
 */
export function parseCSV(text: string): ParsedContact[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const contacts: ParsedContact[] = [];

  const nameIndex = headers.findIndex(h => 
    h.includes('name') || h.includes('full name') || h.includes('contact')
  );
  const emailIndex = headers.findIndex(h => 
    h.includes('email') || h.includes('e-mail')
  );
  const phoneIndex = headers.findIndex(h => 
    h.includes('phone') || h.includes('mobile') || h.includes('tel')
  );
  const addressIndex = headers.findIndex(h => 
    h.includes('address') || h.includes('location') || h.includes('street') || h.includes('city')
  );

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const contact: ParsedContact = {
      name: nameIndex >= 0 ? values[nameIndex] || '' : '',
      email: emailIndex >= 0 ? values[emailIndex] || '' : '',
      phone: phoneIndex >= 0 ? values[phoneIndex] || '' : '',
      address: addressIndex >= 0 ? values[addressIndex] || '' : undefined,
    };

    headers.forEach((header, index) => {
      if (!['name', 'email', 'phone', 'address', 'location', 'street', 'city'].some(h => header.includes(h))) {
        contact[header] = values[index] || '';
      }
    });

    if (contact.name || contact.email) {
      contacts.push(contact);
    }
  }

  return contacts;
}

/**
 * Parses VCF content and extracts contacts
 */
export function parseVCF(text: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const vcards = text.split(/BEGIN:VCARD/i);
  
  for (const vcard of vcards) {
    if (!vcard.trim()) continue;

    const contact: ParsedContact = {
      name: '',
      email: '',
      phone: '',
      address: '',
    };

    const fnMatch = vcard.match(/FN[;:]?(.*?)(?:\r?\n|$)/i);
    if (fnMatch) {
      contact.name = fnMatch[1].trim();
    }

    const nMatch = vcard.match(/N[;:]?(.*?)(?:\r?\n|$)/i);
    if (nMatch && !contact.name) {
      const nameParts = nMatch[1].split(';').map(p => p.trim());
      contact.name = nameParts.filter(p => p).join(' ');
    }

    const emailMatch = vcard.match(/EMAIL[;:]?(.*?)(?:\r?\n|$)/gi);
    if (emailMatch) {
      const emailLine = emailMatch[0];
      const emailValue = emailLine.split(/[;:]/).pop()?.trim();
      if (emailValue) {
        contact.email = emailValue;
      }
    }

    const telMatch = vcard.match(/TEL[;:]?(.*?)(?:\r?\n|$)/gi);
    if (telMatch) {
      const telLine = telMatch[0];
      const telValue = telLine.split(/[;:]/).pop()?.trim();
      if (telValue) {
        contact.phone = telValue.replace(/[^\d+()-]/g, '');
      }
    }

    const adrMatch = vcard.match(/ADR[;:]?(.*?)(?:\r?\n|$)/i);
    if (adrMatch) {
      const addressParts = adrMatch[1].split(';').map(p => p.trim()).filter(p => p);
      contact.address = addressParts.join(', ');
    } else {
      const orgMatch = vcard.match(/ORG[;:]?(.*?)(?:\r?\n|$)/i);
      if (orgMatch) {
        contact.address = orgMatch[1].trim();
      }
    }

    if (contact.name || contact.email) {
      contacts.push(contact);
    }
  }

  return contacts;
}
