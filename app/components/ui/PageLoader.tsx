'use client';

import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  /** Optional message below the spinner */
  message?: string;
}

/**
 * Full-page loading state. Use as the default until all data and network requests
 * for a page are complete, then show page content.
 */
export default function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin"
          aria-hidden
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
