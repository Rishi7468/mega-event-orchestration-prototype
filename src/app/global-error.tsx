"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-risk-critical-bg text-risk-critical">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">System Error Recovered</h1>
        <p className="mt-2 max-w-md text-center text-xs text-foreground-muted">
          A root-level exception occurred. Click below to restore the application state.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Reset & Reload Session
        </button>
      </body>
    </html>
  );
}
