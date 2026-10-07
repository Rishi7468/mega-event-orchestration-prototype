"use client";

import type { H3CellStats } from "@/lib/spatial/h3Grid";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { X, ShieldAlert, Activity, Users, PlusCircle } from "lucide-react";

type H3CellInspectorModalProps = {
  cellStats: H3CellStats | null;
  onClose: () => void;
};

export function H3CellInspectorModal({ cellStats, onClose }: H3CellInspectorModalProps) {
  const autoPlaceRecommendedResources = useEventAuthoringStore(
    (state) => state.autoPlaceRecommendedResources,
  );

  if (!cellStats) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent">H3 INDEX: {cellStats.h3Index}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                  cellStats.riskLevel === "critical"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : cellStats.riskLevel === "high"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {cellStats.riskLevel} RISK
              </span>
            </div>
            <h2 className="text-sm font-bold text-foreground mt-0.5">Spatial Hexagon Cell Intelligence</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Population & Pressure Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3 space-y-1">
            <span className="text-[10px] text-foreground-muted font-mono uppercase block flex items-center gap-1">
              <Users className="h-3 w-3 text-accent" /> Simulated Population
            </span>
            <span className="font-mono text-base font-bold text-foreground">
              {cellStats.simulatedPopulation.toLocaleString()}
            </span>
            <span className="text-[10px] text-foreground-muted block">
              Cap: {cellStats.expectedPopulation.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/50 p-3 space-y-1">
            <span className="text-[10px] text-foreground-muted font-mono uppercase block flex items-center gap-1">
              <Activity className="h-3 w-3 text-amber-400" /> Crowd Pressure Ratio
            </span>
            <span
              className={`font-mono text-base font-bold ${
                cellStats.pressurePercent > 80 ? "text-red-400" : "text-amber-400"
              }`}
            >
              {cellStats.pressurePercent}%
            </span>
            <span className="text-[10px] text-foreground-muted block">Sector Density Index</span>
          </div>
        </div>

        {/* Resource Coverage & Community Signals */}
        <div className="space-y-2 border-t border-border pt-3">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-accent" /> Spatial Coverage & Community Signals
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
              <span>Medical Response Coverage</span>
              <span
                className={`font-mono font-bold ${
                  cellStats.medicalCoveragePercent < 60 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {cellStats.medicalCoveragePercent}% ({cellStats.medicalCount} Units)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
              <span>Field Officer Patrol Coverage</span>
              <span className="font-mono font-bold text-emerald-400">
                {cellStats.fieldCoveragePercent}% ({cellStats.fieldTeamCount} Officers)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
              <span>Aggregated Visitor Reports</span>
              <span
                className={`font-mono font-bold ${
                  cellStats.visitorReportCount > 4 ? "text-amber-400" : "text-foreground-muted"
                }`}
              >
                {cellStats.visitorReportCount} Reports
              </span>
            </div>
          </div>
        </div>

        {/* Intelligence Rationale & Candidate Recommendation */}
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 space-y-2 text-xs">
          <div className="font-bold text-accent flex items-center gap-1.5">
            💡 PRAVAAH SPATIAL RECOMMENDATION
          </div>
          <p className="text-foreground-muted leading-relaxed">
            {cellStats.pressurePercent > 75 && cellStats.medicalCoveragePercent < 60
              ? "High population density combined with low medical coverage ratio. Deploying an additional Medical Unit is strongly recommended."
              : "Cell operating within safe thresholds. Maintain active CCTV surveillance and field team patrols."}
          </p>

          {cellStats.medicalCoveragePercent < 60 && (
            <button
              type="button"
              onClick={() => {
                autoPlaceRecommendedResources();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-sm hover:bg-accent/90 transition-all mt-2"
            >
              <PlusCircle className="h-4 w-4" /> Deploy Recommended Medical Unit Here
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
