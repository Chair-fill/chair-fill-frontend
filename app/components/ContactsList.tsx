'use client';

import { useState } from 'react';
import { useContacts } from '../context/ContactsContext';
import { User, Mail, Phone, Building2, Trash2, Users, Plus } from 'lucide-react';
import ContactUploadModal from './ContactUploadModal';

export default function ContactsList() {
  const { contacts, removeContact, clearAllContacts } = useContacts();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              Upload a CSV or VCF file to add contacts to your list
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Contacts
            </button>
          </div>
        </div>
        <ContactUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              All Contacts ({contacts.length})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contacts
            </button>
            <button
              onClick={clearAllContacts}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

      <div className="overflow-x-auto">
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
                  <Building2 className="w-4 h-4" />
                  Organization
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
                  {contact.email || '-'}
                </td>
                <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                  {contact.phone || '-'}
                </td>
                <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                  {contact.organization || '-'}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <ContactUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
