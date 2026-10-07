"use client";

import React from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";

interface DesignModeHeaderProps {
  onApplyDesign?: () => void;
  onCancelDesign?: () => void;
}

export const DesignModeHeader: React.FC<DesignModeHeaderProps> = ({ onApplyDesign, onCancelDesign }) => {
  const isDesignModeActive = useEventAuthoringStore((state) => state.isDesignModeActive);
  const isViewportLocked = useEventAuthoringStore((state) => state.isViewportLocked);
  const locationName = useEventAuthoringStore((state) => state.locationName);
  const toggleViewportLock = useEventAuthoringStore((state) => state.toggleViewportLock);
  const cancelSpatialDesign = useEventAuthoringStore((state) => state.cancelSpatialDesign);
  const undo = useEventAuthoringStore((state) => state.undo);
  const redo = useEventAuthoringStore((state) => state.redo);

  if (!isDesignModeActive) return null;

  return (
    <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/50 bg-slate-950/95 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-2xl">
      {/* Mode Status Indicator */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
        </span>
        <span className="font-bold text-cyan-300 tracking-wide uppercase">
          DESIGN MODE {isViewportLocked ? "• MAP LOCKED" : "• MAP UNLOCKED"}
        </span>
        <span className="hidden sm:inline text-slate-400 font-sans text-[11px]">|</span>
        <span className="hidden sm:inline text-slate-300 font-semibold truncate max-w-[200px]">
          Region: {locationName}
        </span>
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleViewportLock}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
            isViewportLocked
              ? "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              : "border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
          }`}
          title="Toggle Leaflet map panning/zooming"
        >
          {isViewportLocked ? "🔓 Unlock Map" : "🔒 Lock Map"}
        </button>

        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            type="button"
            onClick={undo}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Redo"
          >
            ↪ Redo
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
          <button
            type="button"
            onClick={onCancelDesign || cancelSpatialDesign}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 font-bold text-red-300 hover:bg-red-500/20"
          >
            ✕ Cancel
          </button>
          <button
            type="button"
            onClick={onApplyDesign}
            className="rounded-lg border border-emerald-400/50 bg-emerald-500 px-3.5 py-1 font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all animate-pulse"
          >
            ✓ Apply Spatial Design
          </button>
        </div>
      </div>
    </div>
  );
};
