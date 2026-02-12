'use client';

import { useState } from 'react';
import { useContacts } from '@/app/providers/ContactsProvider';
import { User, Mail, Phone, MapPin, Trash2, Users, Plus, Upload, Send, Loader2 } from 'lucide-react';
import ContactUploadModal from "@/app/features/contacts/components/ContactUploadModal";
import AddContactModal from "@/app/features/contacts/components/AddContactModal";
import { sendOutreach } from "@/lib/api/outreach";
import { isDemoMode } from "@/lib/demo";

const DEFAULT_OUTREACH_MESSAGE = 'Follow up on your appointment';

export default function ContactsList() {
  const { contacts, isLoaded, removeContact, clearAllContacts } = useContacts();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [loadingContactId, setLoadingContactId] = useState<string | null>(null);

  const handleOutreach = async (contact: { id: string; name: string; email: string; phone: string }) => {
    setLoadingContactId(contact.id);
    try {
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 800));
        return;
      }
      const phone = contact.phone?.trim() || '';
      if (!phone) {
        console.warn('Contact has no phone number for outreach');
        return;
      }
      await sendOutreach({
        message: DEFAULT_OUTREACH_MESSAGE,
        phone_number: phone,
        send_to_all: false,
      });
    } catch (error) {
      console.error("Error sending outreach:", error);
    } finally {
      setLoadingContactId(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 p-12">
          <Loader2 className="w-12 h-12 text-zinc-400 dark:text-zinc-500 animate-spin" aria-hidden />
          <p className="text-zinc-600 dark:text-zinc-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 shadow-sm">
          <div className="text-center">
            <Users className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              No contacts yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Add a contact with the form or upload a CSV/VCF file to add many at once
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAddContactModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add contact
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                Upload contacts (CSV/VCF)
              </button>
            </div>
          </div>
        </div>
        <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setIsAddContactModalOpen(false)} />
        <ContactUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900 dark:text-zinc-50" />
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              All Contacts ({contacts.length})
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:inline">Add contact</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="sm:inline">Upload contacts</span>
            </button>
            <button
              onClick={clearAllContacts}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sm:inline">Clear All</span>
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {contact.name || 'Unnamed Contact'}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOutreach(contact)}
                    disabled={loadingContactId === contact.id}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Start outreach"
                  >
                    {loadingContactId === contact.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-500 shrink-0" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-500 shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {contact.phone}
                    </span>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-500 shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {contact.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-zinc-900 dark:text-zinc-50">
                    {contact.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {contact.phone || '-'}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {contact.address || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOutreach(contact)}
                        disabled={loadingContactId === contact.id}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Start outreach"
                      >
                        {loadingContactId === contact.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setIsAddContactModalOpen(false)} />
      <ContactUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </>
  );
}
