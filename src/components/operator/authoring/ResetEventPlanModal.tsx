import React, { useState } from "react";
import { X, Trash2, AlertTriangle, CheckSquare, Square, RefreshCw, Sparkles } from "lucide-react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";

interface ResetEventPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetEventPlanModal: React.FC<ResetEventPlanModalProps> = ({ isOpen, onClose }) => {
  const zones = useEventAuthoringStore((state) => state.zones);
  const routes = useEventAuthoringStore((state) => state.routes);
  const assets = useEventAuthoringStore((state) => state.assets);
  const anchors = useEventAuthoringStore((state) => state.anchors);
  const paintedAreas = useEventAuthoringStore((state) => state.paintedAreas);

  const startFreshPlan = useEventAuthoringStore((state) => state.startFreshPlan);
  const resetCurrentPlanToBaseline = useEventAuthoringStore((state) => state.resetCurrentPlanToBaseline);

  const clearZones = useEventAuthoringStore((state) => state.clearZones);
  const clearRoutes = useEventAuthoringStore((state) => state.clearRoutes);
  const clearResources = useEventAuthoringStore((state) => state.clearResources);
  const clearAnchors = useEventAuthoringStore((state) => state.clearAnchors);
  const clearPaintedAreas = useEventAuthoringStore((state) => state.clearPaintedAreas);

  const [resetMode, setResetMode] = useState<"fresh" | "baseline" | "custom">("fresh");
  const [keepRegionPerimeter, setKeepRegionPerimeter] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState({
    zones: true,
    routes: true,
    resources: true,
    anchors: true,
    paint: true,
  });

  if (!isOpen) return null;

  const totalObjectsCount = zones.length + routes.length + assets.length + anchors.length + (paintedAreas?.length || 0);

  const handleExecuteReset = () => {
    if (resetMode === "fresh") {
      startFreshPlan(keepRegionPerimeter);
    } else if (resetMode === "baseline") {
      resetCurrentPlanToBaseline();
    } else {
      if (selectedItems.zones) clearZones();
      if (selectedItems.routes) clearRoutes();
      if (selectedItems.resources) clearResources();
      if (selectedItems.anchors) clearAnchors();
      if (selectedItems.paint) clearPaintedAreas();
    }
    onClose();
  };

  const toggleItem = (key: keyof typeof selectedItems) => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-rose-900/40 bg-slate-900 shadow-2xl shadow-rose-950/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-rose-950/20 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Reset & Start Fresh</h3>
              <p className="text-xs text-rose-300 font-medium">
                {totalObjectsCount} total operational elements active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setResetMode("fresh")}
              className={`rounded-lg py-2 px-2 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                resetMode === "fresh" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start Fresh</span>
            </button>
            <button
              type="button"
              onClick={() => setResetMode("baseline")}
              className={`rounded-lg py-2 px-2 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                resetMode === "baseline" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restore Default</span>
            </button>
            <button
              type="button"
              onClick={() => setResetMode("custom")}
              className={`rounded-lg py-2 px-2 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                resetMode === "custom" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Selective</span>
            </button>
          </div>

          {resetMode === "fresh" && (
            <div className="space-y-3 rounded-xl border border-rose-900/30 bg-rose-950/20 p-4">
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                ✦ <strong className="text-rose-300">Start Fresh:</strong> Clears all operational spatial objects (zones, CCTV, routes, anchors, paint layers) to provide a completely blank authoring workspace.
              </p>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={keepRegionPerimeter}
                  onChange={(e) => setKeepRegionPerimeter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500/50"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Keep confirmed region perimeter boundary ({keepRegionPerimeter ? "Preserved" : "Cleared"})
                </span>
              </label>
            </div>
          )}

          {resetMode === "baseline" && (
            <div className="space-y-2 rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4">
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                🔄 <strong className="text-indigo-300">Restore Baseline:</strong> Reverts the current event profile back to its verified default state and recommended operational layout.
              </p>
            </div>
          )}

          {resetMode === "custom" && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <label
                onClick={() => toggleItem("zones")}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {selectedItems.zones ? (
                    <CheckSquare className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                  Operational Zones
                </div>
                <span className="text-xs font-bold text-slate-400">{zones.length}</span>
              </label>

              <label
                onClick={() => toggleItem("anchors")}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {selectedItems.anchors ? (
                    <CheckSquare className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                  Gates & Anchors
                </div>
                <span className="text-xs font-bold text-slate-400">{anchors.length}</span>
              </label>

              <label
                onClick={() => toggleItem("routes")}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {selectedItems.routes ? (
                    <CheckSquare className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                  Emergency Routes
                </div>
                <span className="text-xs font-bold text-slate-400">{routes.length}</span>
              </label>

              <label
                onClick={() => toggleItem("resources")}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  {selectedItems.resources ? (
                    <CheckSquare className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                  Resources & Assets
                </div>
                <span className="text-xs font-bold text-slate-400">{assets.length}</span>
              </label>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteReset}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-all uppercase tracking-wide"
            >
              <Trash2 className="h-4 w-4" /> Confirm Reset Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

