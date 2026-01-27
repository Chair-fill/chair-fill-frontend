'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle2, X } from 'lucide-react';
import { useContacts } from '../context/ContactsContext';

interface ContactUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactUploadModal({ isOpen, onClose }: ContactUploadModalProps) {
  const { addContacts } = useContacts();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface ParsedContact {
    name: string;
    email: string;
    phone: string;
    organization?: string;
    [key: string]: string | undefined;
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const parseCSV = (text: string): ParsedContact[] => {
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
    const orgIndex = headers.findIndex(h => 
      h.includes('organization') || h.includes('company') || h.includes('org')
    );

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact: ParsedContact = {
        name: nameIndex >= 0 ? values[nameIndex] || '' : '',
        email: emailIndex >= 0 ? values[emailIndex] || '' : '',
        phone: phoneIndex >= 0 ? values[phoneIndex] || '' : '',
        organization: orgIndex >= 0 ? values[orgIndex] || '' : '',
      };

      headers.forEach((header, index) => {
        if (!['name', 'email', 'phone', 'organization', 'company', 'org'].some(h => header.includes(h))) {
          contact[header] = values[index] || '';
        }
      });

      if (contact.name || contact.email) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const parseVCF = (text: string): ParsedContact[] => {
    const contacts: ParsedContact[] = [];
    const vcards = text.split(/BEGIN:VCARD/i);
    
    for (const vcard of vcards) {
      if (!vcard.trim()) continue;

      const contact: ParsedContact = {
        name: '',
        email: '',
        phone: '',
        organization: '',
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

      const orgMatch = vcard.match(/ORG[;:]?(.*?)(?:\r?\n|$)/i);
      if (orgMatch) {
        contact.organization = orgMatch[1].trim();
      }

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
    setUploadSuccess(false);

    try {
      const text = await file.text();
      let parsedContacts: ParsedContact[] = [];

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
        setUploadSuccess(false);
      } else {
        addContacts(parsedContacts);
        setUploadSuccess(true);
        setError('');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Close modal after 2 seconds on success
        setTimeout(() => {
          setUploadSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError('Error reading file. Please make sure the file is valid.');
      setUploadSuccess(false);
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

  const handleClose = () => {
    setError('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Upload Contacts
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
              id="contact-file-input-modal"
            />
            <label
              htmlFor="contact-file-input-modal"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-zinc-400 dark:text-zinc-600 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-600" />
              )}
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

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Contacts uploaded successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
