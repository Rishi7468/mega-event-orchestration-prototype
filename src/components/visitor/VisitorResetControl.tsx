"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, RotateCcw, AlertTriangle, X } from "lucide-react";
import { resetDemo } from "@/lib/demo";

type VisitorResetControlProps = {
  variant?: "header" | "compact";
  className?: string;
};

export function VisitorResetControl({
  variant = "header",
  className = "",
}: VisitorResetControlProps) {
  const [mounted, setMounted] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleConfirmReset = () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      resetDemo();
      setIsConfirmOpen(false);
      setShowSuccessToast(true);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/90 hover:bg-surface-muted text-foreground px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${className}`}
          title="Reset demonstration to initial baseline state"
        >
          <RotateCcw className="h-3.5 w-3.5 text-accent" />
          <span>Reset Demo</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border border-border/70 bg-surface/80 hover:bg-surface text-foreground-muted hover:text-foreground transition-colors shrink-0 ${className}`}
          title="Reset demonstration to initial baseline state"
        >
          <RotateCcw className="h-2.5 w-2.5 text-accent" />
          <span>Reset Demo</span>
        </button>
      )}

      {/* CONFIRMATION DIALOG MODAL (PORTALED TO DOCUMENT.BODY TO PREVENT CONTAINING-BLOCK CLIPPING) */}
      {isConfirmOpen && mounted && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-border bg-surface text-foreground p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="reset-dialog-title" className="text-sm font-semibold text-foreground">
                      Reset Demo Simulation?
                    </h3>
                    <p className="text-[11px] text-foreground-muted">
                      Restore baseline conditions
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="rounded-full p-1 text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                This will restore normal crowd conditions, clear active alerts & reroutes,
                reconnect any simulated offline status, and reset your journey back to the
                initial route (Gate 2 · Sangam Ghat).
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm disabled:opacity-50"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
                  {isResetting ? "Resetting..." : "Confirm Reset"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* SUBTLE SUCCESS TOAST (PORTALED TO DOCUMENT.BODY) */}
      {showSuccessToast && mounted && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 border border-emerald-400/40"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
            <span>Demo reset successfully</span>
          </div>,
          document.body
        )}
    </>
  );
}
