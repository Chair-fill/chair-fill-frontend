'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for debugging
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500 dark:text-amber-400 mb-4" aria-hidden />
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Please refresh the page. If the problem continues, try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh page
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
