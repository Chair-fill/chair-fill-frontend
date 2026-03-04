"use client";

import { useState, useEffect, useRef } from "react";
import { X, Radio, Loader2, CheckCircle2 } from "lucide-react";
import { useModalKeyboard, useModalScrollLock } from "@/lib/hooks/use-modal";
import { sendBlast } from "@/lib/api/outreach";
import { isDemoMode } from "@/lib/demo";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import FormError from "@/app/components/ui/FormError";
import { formatDisplayName } from "@/lib/utils/format";
import type { Contact } from "@/lib/types/contact";

const FALLBACK_OUTREACH_MESSAGE = "Follow up on your appointment";

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
  const { technician } = useTechnician();
  const technicianId = technician?.id ?? technician?.technician_id ?? "";
  const defaultMessage = FALLBACK_OUTREACH_MESSAGE;

  const toSend = selectedContacts.filter((c) => c.phone?.trim());
  const count = toSend.length;

  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [message, setMessage] = useState("");
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setShowSuccess(false);
      setSentCount(0);
      setMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setError("");
    setIsSending(false);
    setShowSuccess(false);
    onClose();
  };

  const doSendBulk = async (text: string) => {
    const contactIds = toSend.map((c) => c.id);
    setError("");
    setIsSending(true);
    setSentCount(0);
    try {
      if (isDemoMode()) {
        for (let i = 0; i < contactIds.length; i++) {
          await new Promise((r) => setTimeout(r, 300));
          setSentCount(i + 1);
        }
      } else {
        if (!technicianId) {
          setError(
            "Technician profile not found. Please complete onboarding first.",
          );
          return;
        }
        await sendBlast({
          contact_ids: contactIds,
          initial_outreach_message: text.trim() || defaultMessage,
          technician_id: technicianId,
        });
        setSentCount(contactIds.length);
      }
      onSent?.();
      setShowSuccess(true);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        closeTimeoutRef.current = null;
        handleClose();
      }, 1800);
    } catch (err) {
      console.error("Bulk outreach failed:", err);
      setError(err instanceof Error ? err.message : "Failed to send blast.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBlast = () => {
    doSendBulk(message.trim() || defaultMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative bg-[#0a0a0a] rounded-2xl border border-border shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Blast to {count} contact{count !== 1 ? "s" : ""}
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
          {showSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-green-800 dark:text-green-200">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                Blast successfully initiated
              </p>
            </div>
          )}
          {error && <FormError message={error} />}

          {toSend.length > 0 && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Selected for blast ({toSend.length}):
              </p>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 max-h-32 overflow-y-auto space-y-1">
                {toSend.map((c) => (
                  <li key={c.id} className="inline ml-2">
                    {formatDisplayName(c.name?.trim()) || "Unnamed"}{" "}
                    {c.phone && (
                      <span className="text-zinc-500">({c.phone})</span>
                    )}
                    ,&nbsp;
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Blast message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add context for the AI agent. Leave blank for generic AI automation."
              rows={4}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 resize-y min-h-[100px]"
            />
          </div>

          <button
            type="button"
            onClick={handleBlast}
            disabled={isSending}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Blasting...
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Blast
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
