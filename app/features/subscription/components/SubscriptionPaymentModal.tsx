'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PlanDetails } from '@/lib/types/subscription';
import { useUser } from '@/app/providers/UserProvider';
import { useModalKeyboard, useModalScrollLock } from '@/lib/hooks/use-modal';
import { api } from '@/lib/api-client';
import { isDemoMode } from '@/lib/demo';

type ModalState = 'confirm' | 'loading' | 'success' | 'failure';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails;
  onSuccess: () => void;
}

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  plan,
  onSuccess,
}: SubscriptionPaymentModalProps) {
  const { user } = useUser();
  const [state, setState] = useState<ModalState>('confirm');
  const [errorMessage, setErrorMessage] = useState('');

  useModalKeyboard(isOpen, onClose);
  useModalScrollLock(isOpen);

  const hasPaymentDetails = user?.paymentMethod && user?.billingInfo;

  const handlePay = async () => {
    if (!hasPaymentDetails && !isDemoMode()) return;
    setState('loading');
    setErrorMessage('');
    try {
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 1200));
        setState('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
        return;
      }
      if (!user) return;
      await api.post('/payment', {
        planId: plan.id,
        amount: plan.price,
        paymentMethod: user.paymentMethod,
        billingInfo: user.billingInfo,
      });
      setState('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setState('failure');
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setState('confirm');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {state === 'confirm' && 'Confirm Payment'}
            {state === 'loading' && 'Processing...'}
            {state === 'success' && 'Payment Successful'}
            {state === 'failure' && 'Payment Failed'}
          </h2>
          {state !== 'loading' && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          )}
        </div>

        <div className="p-6">
          {!hasPaymentDetails && state === 'confirm' && (
            <div className="text-center space-y-4">
              <CreditCard className="w-12 h-12 text-zinc-400 mx-auto" />
              <p className="text-zinc-600 dark:text-zinc-400">
                Add your payment and billing details in Account Settings before subscribing.
              </p>
              <Link
                href="/profile"
                onClick={handleClose}
                className="inline-block px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium"
              >
                Go to Account Settings
              </Link>
            </div>
          )}

          {hasPaymentDetails && state === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Plan</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    ${plan.price.toFixed(2)}/{plan.pricePeriod}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your saved card will be charged. You can update payment details in Account Settings.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay ${plan.price.toFixed(2)}
                </button>
              </div>
            </div>
          )}

          {state === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-zinc-900 dark:text-zinc-50 animate-spin" />
              <p className="text-zinc-600 dark:text-zinc-400">Processing your payment...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <p className="text-zinc-900 dark:text-zinc-50 font-medium">Payment successful!</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Your subscription to {plan.name} is now active.
              </p>
            </div>
          )}

          {state === 'failure' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-center text-zinc-600 dark:text-zinc-400">{errorMessage}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { setState('confirm'); setErrorMessage(''); }}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
