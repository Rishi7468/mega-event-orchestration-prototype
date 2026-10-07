import React, { useState } from "react";
import { X, Layers, ShieldAlert, Users, Activity, Check } from "lucide-react";
import type { CanonicalOperationalZone } from "@/types/eventPlan";
import type { LatLng } from "@/data/geography";
import { GeometryEngine } from "@/lib/spatial/geometryEngine";

interface ZoneConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: Omit<CanonicalOperationalZone, "id">) => void;
  initialBoundary?: LatLng[];
  editingZone?: CanonicalOperationalZone | null;
}

export const ZoneConfigModal: React.FC<ZoneConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBoundary = [],
  editingZone = null,
}) => {
  const boundary = editingZone?.boundary || initialBoundary;
  const areaSqM = Math.round(GeometryEngine.calculateAreaSqKm(boundary) * 1_000_000);
  const recommendedCap = Math.round(areaSqM * 2.0); // 2 people / m2 default

  const [name, setName] = useState(() => editingZone?.name || `Operational Sector Alpha`);
  const [code, setCode] = useState(() => editingZone?.code || `ZONE-A`);
  const [type, setType] = useState<CanonicalOperationalZone["type"]>(editingZone?.type || "venue");
  const [capacity, setCapacity] = useState<number>(editingZone?.capacity || (recommendedCap > 0 ? recommendedCap : 15000));
  const [riskLevel, setRiskLevel] = useState<CanonicalOperationalZone["riskLevel"]>(editingZone?.riskLevel || "low");
  const [ingressRate, setIngressRate] = useState<number>(editingZone?.ingressRatePerMin || 300);
  const [egressRate, setEgressRate] = useState<number>(editingZone?.egressRatePerMin || 300);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      code,
      type,
      capacity,
      currentPopulation: editingZone?.currentPopulation || 0,
      ingressRatePerMin: ingressRate,
      egressRatePerMin: egressRate,
      cctvCount: editingZone?.cctvCount || Math.max(2, Math.ceil(areaSqM / 5000)),
      fieldTeamCount: editingZone?.fieldTeamCount || Math.max(2, Math.ceil(areaSqM / 10000)),
      medicalUnitsCount: editingZone?.medicalUnitsCount || 1,
      emergencyAccess: editingZone?.emergencyAccess || "clear",
      riskLevel,
      boundary,
      elevationMeters: 10,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-indigo-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingZone ? "Edit Operational Zone" : "Configure New Zone"}
              </h3>
              <p className="text-xs text-slate-400">
                {areaSqM > 0 ? `Area: ${(areaSqM / 1000).toFixed(1)}k m² | Perimeter: ${boundary.length} vertices` : "Set operational metrics"}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Zone Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sector Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CanonicalOperationalZone["type"])}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="venue">Venue / Event Core</option>
                <option value="transit">Transit / Holding Sector</option>
                <option value="mixed">Mixed Services Plaza</option>
                <option value="emergency">Emergency / Security Buffer</option>
                <option value="accommodation">Accommodation / Camping</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Classification</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as CanonicalOperationalZone["riskLevel"])}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical High Density</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Capacity & Crowd Limits
              </span>
              {areaSqM > 0 && (
                <button
                  type="button"
                  onClick={() => setCapacity(recommendedCap)}
                  className="text-[11px] text-indigo-400 hover:underline font-medium"
                >
                  Use Rec ({recommendedCap.toLocaleString()})
                </button>
              )}
            </div>
            <div>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={100}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Target density: {(capacity / Math.max(1, areaSqM)).toFixed(2)} visitors/m²
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Ingress Rate (/min)
              </label>
              <input
                type="number"
                value={ingressRate}
                onChange={(e) => setIngressRate(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Egress Rate (/min)
              </label>
              <input
                type="number"
                value={egressRate}
                onChange={(e) => setEgressRate(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Check className="h-4 w-4" /> Save Zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
