'use client';

import { useEffect } from 'react';

/**
 * Catches errors that escape the root layout (e.g. in Providers).
 * Replaces the entire app with this UI, so we must include html/body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl" aria-hidden>
            !
          </div>
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
      </body>
    </html>
  );
}
