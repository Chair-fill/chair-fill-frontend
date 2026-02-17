'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Radio, MessageSquare, Loader2, ChevronRight, Users } from 'lucide-react';
import { useModalKeyboard, useModalScrollLock } from '@/lib/hooks/use-modal';
import { useUser } from '@/app/providers/UserProvider';
import { sendOutreach } from '@/lib/api/outreach';
import { isDemoMode } from '@/lib/demo';
import FormError from '@/app/components/ui/FormError';
import { formatDisplayName } from '@/lib/utils/format';
import type { Contact } from '@/lib/types/contact';

const FALLBACK_OUTREACH_MESSAGE = 'Follow up on your appointment';

type Step = 'select' | 'message';

interface BulkOutreachModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSent?: () => void;
}

export default function BulkOutreachModal({ isOpen, contacts, onClose, onSent }: BulkOutreachModalProps) {
  const { user } = useUser();
  const userDefaultEmpty = !user?.defaultOutreachMessage?.trim();
  const defaultMessage = (user?.defaultOutreachMessage?.trim() || FALLBACK_OUTREACH_MESSAGE);

  const contactsWithPhone = contacts.filter((c) => c.phone?.trim());
  const [step, setStep] = useState<Step>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [message, setMessage] = useState(defaultMessage);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedIds(new Set());
      setMode('default');
      setMessage(defaultMessage);
      setError(userDefaultEmpty ? 'Set a default broadcast message in your profile (Technician tab) first.' : '');
      setSentCount(0);
    }
  }, [isOpen, defaultMessage, userDefaultEmpty]);

  const selectedContacts = contactsWithPhone.filter((c) => selectedIds.has(c.id));
  const selectedCount = selectedContacts.length;

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllWithPhone = useCallback(() => {
    setSelectedIds(new Set(contactsWithPhone.map((c) => c.id)));
  }, [contactsWithPhone]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const goToMessage = () => {
    if (selectedCount === 0) {
      setError('Select at least one contact with a phone number.');
      return;
    }
    setError('');
    setStep('message');
  };

  const goBack = () => {
    setStep('select');
    setError('');
  };

  const handleClose = () => {
    setStep('select');
    setSelectedIds(new Set());
    setMode('default');
    setMessage(defaultMessage);
    setError('');
    setIsSending(false);
    onClose();
  };

  const doSendBulk = async (text: string) => {
    const toSend = selectedContacts.map((c) => ({ ...c, phone: c.phone!.trim() }));
    setError('');
    setIsSending(true);
    setSentCount(0);
    try {
      if (isDemoMode()) {
        for (let i = 0; i < toSend.length; i++) {
          await new Promise((r) => setTimeout(r, 300));
          setSentCount(i + 1);
        }
      } else {
        for (let i = 0; i < toSend.length; i++) {
          await sendOutreach({
            message: text.trim() || defaultMessage,
            phone_number: toSend[i].phone,
            send_to_all: false,
          });
          setSentCount(i + 1);
        }
      }
      onSent?.();
      handleClose();
    } catch (err) {
      console.error('Bulk outreach failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send broadcast.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWithDefault = () => {
    if (userDefaultEmpty) {
      setError('Set a default outreach message in your profile (Technician tab) first.');
      return;
    }
    doSendBulk(defaultMessage);
  };

  const handleSendCustom = () => {
    const text = message.trim();
    if (!text && userDefaultEmpty) {
      setError('Enter a message or set a default broadcast message in your profile.');
      return;
    }
    doSendBulk(text || defaultMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {step === 'select' ? 'Select contacts for outreach' : 'Choose message'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {error && <FormError message={error} />}

          {step === 'select' ? (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Select contacts you want to send outreach to. Only contacts with a phone number can receive messages.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={selectAllWithPhone}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select all with phone ({contactsWithPhone.length})
                </button>
                <span className="text-zinc-400">|</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              <ul className="border border-zinc-200 dark:border-zinc-700 rounded-lg divide-y divide-zinc-200 dark:divide-zinc-700 max-h-72 overflow-y-auto">
                {contacts.map((c) => {
                  const hasPhone = Boolean(c.phone?.trim());
                  return (
                    <li
                      key={c.id}
                      className={`flex items-center gap-3 px-3 py-3 ${hasPhone ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : 'opacity-70'}`}
                    >
                      <input
                        type="checkbox"
                        id={`bulk-${c.id}`}
                        checked={selectedIds.has(c.id)}
                        onChange={() => hasPhone && toggleOne(c.id)}
                        disabled={!hasPhone}
                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor={`bulk-${c.id}`}
                        className={`flex-1 text-sm text-zinc-900 dark:text-zinc-50 ${hasPhone ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        {formatDisplayName(c.name) || 'Unnamed'}
                        {hasPhone ? (
                          <span className="text-zinc-500 ml-1">({c.phone})</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 ml-1">(no phone)</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
              {contacts.length === 0 ? (
                <p className="text-sm text-zinc-500">No contacts yet. Add contacts first.</p>
              ) : (
                <p className="text-sm text-zinc-500">
                  {selectedCount} selected
                  {contactsWithPhone.length < contacts.length &&
                    ` (${contacts.length - contactsWithPhone.length} without phone skipped)`}
                </p>
              )}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={goToMessage}
                  disabled={contactsWithPhone.length === 0 || selectedCount === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sending to {selectedCount} contact{selectedCount !== 1 ? 's' : ''}.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSendWithDefault}
                  disabled={isSending || userDefaultEmpty}
                  className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending {sentCount}/{selectedCount}...
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      Broadcast with default message
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  disabled={isSending}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use custom message
                </button>
              </div>

              {mode === 'custom' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={defaultMessage}
                    rows={4}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 resize-y min-h-[100px]"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={isSending}
                      className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCustom}
                      disabled={isSending}
                      className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending {sentCount}/{selectedCount}...
                        </>
                      ) : (
                        <>
                          <Radio className="w-4 h-4" />
                          Broadcast to {selectedCount} contacts
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode !== 'custom' && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSending}
                  className="w-full mt-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium disabled:opacity-50"
                >
                  Back to selection
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
