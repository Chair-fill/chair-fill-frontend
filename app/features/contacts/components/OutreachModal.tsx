'use client';

import { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { useModalKeyboard, useModalScrollLock } from '@/lib/hooks/use-modal';
import { useUser } from '@/app/providers/UserProvider';
import { sendOutreach } from '@/lib/api/outreach';
import { isDemoMode } from '@/lib/demo';
import FormError from '@/app/components/ui/FormError';

const FALLBACK_OUTREACH_MESSAGE = 'Follow up on your appointment';

export interface OutreachContact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface OutreachModalProps {
  isOpen: boolean;
  contact: OutreachContact | null;
  onClose: () => void;
  onSent?: () => void;
}

export default function OutreachModal({ isOpen, contact, onClose, onSent }: OutreachModalProps) {
  const { user } = useUser();
  const userDefaultEmpty = !user?.defaultOutreachMessage?.trim();
  const defaultMessage = (user?.defaultOutreachMessage?.trim() || FALLBACK_OUTREACH_MESSAGE);
  const [mode, setMode] = useState<'choice' | 'customize'>('choice');
  const [message, setMessage] = useState(defaultMessage);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setError(userDefaultEmpty ? 'Please set a default outreach message in your profile first.' : '');
    }
  }, [isOpen, defaultMessage, userDefaultEmpty]);

  const reset = () => {
    setMode('choice');
    setMessage(defaultMessage);
    setError('');
    setIsSending(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const doSend = async (text: string) => {
    if (!contact?.phone?.trim()) {
      setError('This contact has no phone number.');
      return;
    }
    setError('');
    setIsSending(true);
    try {
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await sendOutreach({
          message: text.trim() || defaultMessage,
          phone_number: contact.phone.trim(),
          send_to_all: false,
        });
      }
      onSent?.();
      handleClose();
    } catch (err) {
      console.error('Outreach failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send outreach.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWithDefault = () => {
    if (userDefaultEmpty) {
      setError('Please set a default outreach message in your profile first.');
      return;
    }
    doSend(defaultMessage);
  };

  const handleSendCustom = () => {
    const text = message.trim();
    if (!text && userDefaultEmpty) {
      setError('Please enter a message or set a default outreach message in your profile.');
      return;
    }
    doSend(text || defaultMessage);
  };

  if (!isOpen) return null;

  const contactName = contact?.name || 'Unnamed contact';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Outreach to {contactName}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && <FormError message={error} />}

          {mode === 'choice' ? (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Send a quick follow-up or add context so the message is tailored to this contact.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSendWithDefault}
                  disabled={isSending || userDefaultEmpty}
                  className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send with default message
                </button>
                <button
                  type="button"
                  onClick={() => setMode('customize')}
                  disabled={isSending}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Customize message
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Edit the message below to add context or tailor the outreach for this contact.
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Message / prompt
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={defaultMessage}
                  rows={4}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 resize-y min-h-[100px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('choice')}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium disabled:opacity-50"
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send outreach
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
