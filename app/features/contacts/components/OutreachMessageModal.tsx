'use client';

import { useState, useEffect } from 'react';
import { X, Radio, MessageSquare, Loader2, Users } from 'lucide-react';
import { useModalKeyboard, useModalScrollLock } from '@/lib/hooks/use-modal';
import { useUser } from '@/app/providers/UserProvider';
import { sendOutreach } from '@/lib/api/outreach';
import { isDemoMode } from '@/lib/demo';
import FormError from '@/app/components/ui/FormError';
import { formatDisplayName } from '@/lib/utils/format';
import type { Contact } from '@/lib/types/contact';

const FALLBACK_OUTREACH_MESSAGE = 'Follow up on your appointment';

interface OutreachMessageModalProps {
  isOpen: boolean;
  selectedContacts: Contact[];
  onClose: () => void;
  onSent?: () => void;
}

export default function OutreachMessageModal({
  isOpen,
  selectedContacts,
  onClose,
  onSent,
}: OutreachMessageModalProps) {
  const { user } = useUser();
  const userDefaultEmpty = !user?.defaultOutreachMessage?.trim();
  const defaultMessage = (user?.defaultOutreachMessage?.trim() || FALLBACK_OUTREACH_MESSAGE);

  const toSend = selectedContacts.filter((c) => c.phone?.trim());
  const count = toSend.length;

  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [message, setMessage] = useState(defaultMessage);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMode('default');
      setMessage(defaultMessage);
      setError('');
      setSentCount(0);
    }
  }, [isOpen, defaultMessage]);

  const handleClose = () => {
    setMode('default');
    setMessage(defaultMessage);
    setError('');
    setIsSending(false);
    onClose();
  };

  const doSendBulk = async (text: string) => {
    const list = toSend.map((c) => ({ ...c, phone: c.phone!.trim() }));
    setError('');
    setIsSending(true);
    setSentCount(0);
    try {
      if (isDemoMode()) {
        for (let i = 0; i < list.length; i++) {
          await new Promise((r) => setTimeout(r, 300));
          setSentCount(i + 1);
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          await sendOutreach({
            message: text.trim() || defaultMessage,
            phone_number: list[i].phone,
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
      setError('Set a default broadcast message in your profile (Technician tab) first.');
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
        className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Broadcast to {count} contact{count !== 1 ? 's' : ''}
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

        <div className="p-4 space-y-4">
          {error && <FormError message={error} />}

          <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Choose how to send the message.
          </p>

          {toSend.length > 0 && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Selected for broadcast ({toSend.length}):
              </p>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 max-h-32 overflow-y-auto space-y-1">
                {toSend.map((c) => (
                  <li key={c.id} className="inline ml-2">
                    {formatDisplayName(c.name?.trim()) || 'Unnamed'} {c.phone && <span className="text-zinc-500">({c.phone})</span>},&nbsp;
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                  Sending {sentCount}/{count}...
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
              <button
                type="button"
                onClick={handleSendCustom}
                disabled={isSending}
                className="w-full px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending {sentCount}/{count}...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    Broadcast to {count} contacts
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
