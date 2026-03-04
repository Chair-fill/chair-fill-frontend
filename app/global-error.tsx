"use client";

import { useEffect } from "react";

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
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0a0a0a] border border-border p-8 shadow-sm text-center">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl"
            aria-hidden
          >
            !
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-foreground/70 mb-6">
            Please refresh the page. If the problem continues, try again later.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              Refresh page
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-foreground border border-border bg-[#121212] hover:bg-foreground/5 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
