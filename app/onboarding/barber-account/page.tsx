'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Scissors, User, MapPin } from 'lucide-react';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import AuthLayout from '@/app/components/ui/AuthLayout';
import AuthCard from '@/app/components/ui/AuthCard';
import FormError from '@/app/components/ui/FormError';
import { ONBOARDING_CHOOSE_PLAN } from '@/lib/auth';
import { US_STATES } from '@/lib/constants/us-states';
import {
  FORM_LABEL,
  INPUT_LEFT_ICON,
  INPUT_ICON_LEFT,
  INPUT_PLAIN,
  BTN_PRIMARY,
} from '@/lib/constants/ui';

export default function BarberAccountPage() {
  const router = useRouter();
  const { createTechnician, isTechnicianLoading } = useTechnician();
  const { progress, isProgressLoading, refetchProgress } = useProgress();
  const [nickName, setNickName] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = 'United States';

  // Page-level progress check: if user is already a technician, redirect to choose-plan or contacts
  useEffect(() => {
    if (isProgressLoading || progress == null) return;
    if (progress.is_technician !== true) return;
    if (progress.has_subscribed === true) {
      router.replace('/contacts');
    } else {
      router.replace(ONBOARDING_CHOOSE_PLAN);
    }
  }, [progress, isProgressLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const addressTrimmed = workAddress.trim();
    if (!addressTrimmed) {
      setError('Please enter your work address.');
      return;
    }
    const stateTrimmed = state.trim();
    if (!stateTrimmed) {
      setError('Please select your state.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTechnician({
        nick_name: nickName.trim() || undefined,
        address: {
          street: addressTrimmed,
          country,
          state: stateTrimmed,
        },
      });
      await refetchProgress();
      router.replace(ONBOARDING_CHOOSE_PLAN);
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isTechnicianLoading || isSubmitting;

  // Wait for progress before showing content (avoids flash before redirect)
  if (isProgressLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-500 dark:text-zinc-400" aria-hidden />
      </div>
    );
  }

  return (
    <AuthLayout className="onboarding-barber-page">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Scissors className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create your barber account
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-sm mx-auto">
          Provide your details to set up your barber account.
        </p>
      </div>

      <AuthCard rounded className="onboarding-barber-form">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <FormError message={error} />}
          <div>
            <label htmlFor="nickName" className={FORM_LABEL}>
              Nickname <span className="text-zinc-500 dark:text-zinc-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <User className={INPUT_ICON_LEFT} />
              <input
                id="nickName"
                name="nickName"
                type="text"
                value={nickName}
                onChange={(e) => {
                  setNickName(e.target.value);
                  setError('');
                }}
                placeholder="How clients know you"
                className={`${INPUT_LEFT_ICON} placeholder:text-zinc-400`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="workAddress" className={FORM_LABEL}>
              Work address
            </label>
            <div className="relative">
              <MapPin className={INPUT_ICON_LEFT} />
              <input
                id="workAddress"
                name="workAddress"
                type="text"
                autoComplete="street-address"
                value={workAddress}
                onChange={(e) => {
                  setWorkAddress(e.target.value);
                  setError('');
                }}
                placeholder="Work address"
                className={`${INPUT_LEFT_ICON} placeholder:text-zinc-400`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="country" className={FORM_LABEL}>
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value="United States"
              readOnly
              className={`${INPUT_PLAIN} bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed text-zinc-500 dark:text-zinc-400`}
            />
          </div>
          <div>
            <label htmlFor="state" className={FORM_LABEL}>
              State
            </label>
            <select
              id="state"
              name="state"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setError('');
              }}
              required
              className="w-full py-2.5 pl-10 pr-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
            >
              <option value="">Select your state</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Continue to choose plan'
            )}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
