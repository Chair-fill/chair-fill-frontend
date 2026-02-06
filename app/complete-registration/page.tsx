'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { getApiErrorMessage } from '@/lib/api-client';

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const { updateProfile, isLoading } = useUser();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = address.trim();
    if (!trimmed) {
      setError('Please enter your work address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProfile({ address: trimmed });
      router.replace('/contacts');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <div className="complete-registration-page min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight complete-reg-title-gradient">
            <span className="inline-block complete-reg-title-1">Almost</span>{' '}
            <span className="inline-block complete-reg-title-2">Done</span>
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 complete-reg-title-2 text-base sm:text-lg max-w-sm mx-auto">
            Provide your work address to finish up your registration.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 complete-reg-form">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="workAddress" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Work address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="workAddress"
                  name="workAddress"
                  type="text"
                  autoComplete="street-address"
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    setError('');
                  }}
                  placeholder="123 Main St, City, State, ZIP"
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 placeholder:text-zinc-400"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finishing...
                </>
              ) : (
                'Finish registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
