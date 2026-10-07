"use client";

import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { GeometryEngine } from "@/lib/spatial/geometryEngine";
import { CheckCircle2, Edit3, Lock, ShieldCheck, MapPin, Layers } from "lucide-react";

type RegionConfirmationBannerProps = {
  onEditRegion?: () => void;
};

export function RegionConfirmationBanner({ onEditRegion }: RegionConfirmationBannerProps) {
  const {
    regionPolygon,
    isRegionDefined,
    isRegionConfirmed,
    isViewportLocked,
    locationName,
    confirmRegion,
    unconfirmRegion,
    toggleViewportLock,
  } = useEventAuthoringStore();

  if (!isRegionDefined || regionPolygon.length < 3) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-xs shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
          <span>
            <strong>STEP 1 — REGION FIRST:</strong> Define the event boundary on the map canvas before placing operational components.
          </span>
        </div>
        {onEditRegion && (
          <button
            onClick={onEditRegion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>DRAW REGION</span>
          </button>
        )}
      </div>
    );
  }

  const areaSqKm = GeometryEngine.calculateAreaSqKm(regionPolygon);
  const areaSqMeters = Math.round(areaSqKm * 1000000);
  const perimeterKm = GeometryEngine.calculatePerimeterKm(regionPolygon);

  if (isRegionConfirmed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-foreground flex items-center gap-2">
                EVENT REGION CONFIRMED
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {locationName}
                </span>
              </span>
              <span className="text-[11px] text-foreground-muted block mt-0.5">
                Area: {areaSqKm} km² ({areaSqMeters.toLocaleString()} m²) • Perimeter: {perimeterKm.toFixed(2)} km
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isViewportLocked) toggleViewportLock();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all"
              title="Fit map viewport camera to event region boundary"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>FIT EVENT</span>
            </button>

            <button
              onClick={toggleViewportLock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isViewportLocked
                  ? "bg-slate-900 text-emerald-400 border-emerald-500/30 hover:bg-slate-800"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{isViewportLocked ? "VIEW LOCKED" : "VIEW UNLOCKED"}</span>
            </button>

            <button
              onClick={() => {
                unconfirmRegion();
                if (onEditRegion) onEditRegion();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>EDIT REGION</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 font-mono text-[11px]">
          <span className="font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            PLANNING MODE — Operational tools unlocked (Zones, Anchors, Routes, Assets, Paint)
          </span>
          <span className="text-cyan-400/70 text-[10px]">Use Draggable Primitives or Questionnaire Candidates</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-mono text-xs shadow-lg animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold text-foreground flex items-center gap-2">
            EVENT REGION DEFINED
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
              {regionPolygon.length} Vertices
            </span>
          </span>
          <span className="text-[11px] text-foreground-muted block mt-0.5">
            Area: {areaSqKm} km² ({areaSqMeters.toLocaleString()} m²) • Perimeter: {perimeterKm.toFixed(2)} km
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEditRegion}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>EDIT REGION</span>
        </button>

        <button
          onClick={() => confirmRegion()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>CONFIRM REGION</span>
        </button>
      </div>
    </div>
  );
}
