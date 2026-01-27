'use client';

import { useState, useRef } from 'react';

interface Contact {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  [key: string]: string | undefined;
}

export default function ContactUpload() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const contacts: Contact[] = [];

    // Find column indices
    const nameIndex = headers.findIndex(h => 
      h.includes('name') || h.includes('full name') || h.includes('contact')
    );
    const emailIndex = headers.findIndex(h => 
      h.includes('email') || h.includes('e-mail')
    );
    const phoneIndex = headers.findIndex(h => 
      h.includes('phone') || h.includes('mobile') || h.includes('tel')
    );
    const orgIndex = headers.findIndex(h => 
      h.includes('organization') || h.includes('company') || h.includes('org')
    );

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact: Contact = {
        name: nameIndex >= 0 ? values[nameIndex] || '' : '',
        email: emailIndex >= 0 ? values[emailIndex] || '' : '',
        phone: phoneIndex >= 0 ? values[phoneIndex] || '' : '',
        organization: orgIndex >= 0 ? values[orgIndex] || '' : '',
      };

      // Add any additional fields
      headers.forEach((header, index) => {
        if (!['name', 'email', 'phone', 'organization', 'company', 'org'].some(h => header.includes(h))) {
          contact[header] = values[index] || '';
        }
      });

      // Only add if at least name or email is present
      if (contact.name || contact.email) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const parseVCF = (text: string): Contact[] => {
    const contacts: Contact[] = [];
    const vcards = text.split(/BEGIN:VCARD/i);
    
    for (const vcard of vcards) {
      if (!vcard.trim()) continue;

      const contact: Contact = {
        name: '',
        email: '',
        phone: '',
        organization: '',
      };

      // Extract FN (Full Name)
      const fnMatch = vcard.match(/FN[;:]?(.*?)(?:\r?\n|$)/i);
      if (fnMatch) {
        contact.name = fnMatch[1].trim();
      }

      // Extract N (Name components)
      const nMatch = vcard.match(/N[;:]?(.*?)(?:\r?\n|$)/i);
      if (nMatch && !contact.name) {
        const nameParts = nMatch[1].split(';').map(p => p.trim());
        contact.name = nameParts.filter(p => p).join(' ');
      }

      // Extract EMAIL
      const emailMatch = vcard.match(/EMAIL[;:]?(.*?)(?:\r?\n|$)/gi);
      if (emailMatch) {
        const emailLine = emailMatch[0];
        const emailValue = emailLine.split(/[;:]/).pop()?.trim();
        if (emailValue) {
          contact.email = emailValue;
        }
      }

      // Extract TEL
      const telMatch = vcard.match(/TEL[;:]?(.*?)(?:\r?\n|$)/gi);
      if (telMatch) {
        const telLine = telMatch[0];
        const telValue = telLine.split(/[;:]/).pop()?.trim();
        if (telValue) {
          contact.phone = telValue.replace(/[^\d+()-]/g, '');
        }
      }

      // Extract ORG
      const orgMatch = vcard.match(/ORG[;:]?(.*?)(?:\r?\n|$)/i);
      if (orgMatch) {
        contact.organization = orgMatch[1].trim();
      }

      // Only add if at least name or email is present
      if (contact.name || contact.email) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const text = await file.text();
      let parsedContacts: Contact[] = [];

      if (file.name.endsWith('.csv')) {
        parsedContacts = parseCSV(text);
      } else if (file.name.endsWith('.vcf')) {
        parsedContacts = parseVCF(text);
      } else {
        setError('Unsupported file format. Please upload a CSV or VCF file.');
        setIsLoading(false);
        return;
      }

      if (parsedContacts.length === 0) {
        setError('No contacts found in the file. Please check the file format.');
      } else {
        setContacts(parsedContacts);
      }
    } catch (err) {
      setError('Error reading file. Please make sure the file is valid.');
      console.error('File parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.vcf'))) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearContacts = () => {
    setContacts([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
          Upload Contacts
        </h2>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.vcf"
            onChange={handleFileUpload}
            className="hidden"
            id="contact-file-input"
          />
          <label
            htmlFor="contact-file-input"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <svg
              className="w-12 h-12 text-zinc-400 dark:text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="space-y-2">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {isLoading ? 'Processing...' : 'Drop your file here or click to browse'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Supports CSV and VCF formats
              </p>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      {contacts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Uploaded Contacts ({contacts.length})
            </h2>
            <button
              onClick={clearContacts}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    Organization
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr
                    key={index}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-zinc-900 dark:text-zinc-50">
                      {contact.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                      {contact.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                      {contact.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                      {contact.organization || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
