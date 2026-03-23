"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for debugging
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-card border border-border p-8 shadow-sm text-center">
        <AlertCircle
          className="w-12 h-12 mx-auto text-amber-500 dark:text-amber-400 mb-4"
          aria-hidden
        />
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
            <RefreshCw className="w-4 h-4" />
            Refresh page
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-foreground border border-border bg-zinc-100 dark:bg-white/5 hover:bg-foreground/5 transition-all"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
