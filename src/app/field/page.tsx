"use client";

import Link from "next/link";
import { FieldTaskPanel } from "@/components/field/FieldTaskPanel";
import { useSimulationStore } from "@/store/simulationStore";

export default function FieldStaffPage() {
  const incidents = useSimulationStore((state) => state.incidents);

  const activeIncidents = incidents.filter((inc) => inc.status !== "resolved");

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pravaah · Field Staff Command Interface</h1>
          <p className="text-xs text-foreground-muted">Sector tactical dispatch & crowd control operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-semibold">
            Status: Active Duty
          </span>
          <Link
            href="/operator"
            className="text-xs text-foreground-muted hover:text-foreground transition-colors underline"
          >
            ← Command Dashboard
          </Link>
        </div>
      </header>

      {/* Incident Alert Bar for Field Officers */}
      {activeIncidents.length > 0 && (
        <div className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-status-critical"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-status-critical">
                Active Critical Incidents ({activeIncidents.length})
              </p>
              <p className="text-xs text-foreground-muted">
                {activeIncidents[0].type.toUpperCase()}: {activeIncidents[0].description} ({activeIncidents[0].zoneId})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono uppercase px-2 py-1 bg-status-critical/20 text-status-critical rounded">
            {activeIncidents[0].status}
          </span>
        </div>
      )}

      {/* Operational Task Dispatch Panel */}
      <FieldTaskPanel />
    </main>
  );
}
