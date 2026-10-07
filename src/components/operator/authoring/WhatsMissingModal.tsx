import React from "react";
import { X, Sparkles, Check, AlertCircle, ShieldAlert, ArrowRight, Eye } from "lucide-react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";

interface WhatsMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewCandidate?: (candidate: { type: string; title: string }) => void;
}

export const WhatsMissingModal: React.FC<WhatsMissingModalProps> = ({
  isOpen,
  onClose,
  onPreviewCandidate,
}) => {
  const zones = useEventAuthoringStore((state) => state.zones);
  const anchors = useEventAuthoringStore((state) => state.anchors);
  const routes = useEventAuthoringStore((state) => state.routes);
  const assets = useEventAuthoringStore((state) => state.assets);
  const center = useEventAuthoringStore((state) => state.centerCoordinates);

  const addAnchor = useEventAuthoringStore((state) => state.addAnchor);
  const addAsset = useEventAuthoringStore((state) => state.addAsset);
  const addRoute = useEventAuthoringStore((state) => state.addRoute);
  const addZone = useEventAuthoringStore((state) => state.addZone);

  if (!isOpen) return null;

  // Real intelligence analysis of current plan
  const issues: Array<{
    id: string;
    title: string;
    severity: "critical" | "warning" | "info";
    description: string;
    actionLabel: string;
    onApply: () => void;
  }> = [];

  // Check 1: Egress Gate presence
  const exitGate = anchors.find((a) => a.type === "exit" || a.name.toLowerCase().includes("egress"));
  if (!exitGate) {
    issues.push({
      id: "gap-egress",
      title: "Missing Dedicated Egress Portal",
      severity: "critical",
      description: "Primary ingress gate currently carries 100% of crowd evacuation risk. Add a dedicated South Egress Gate.",
      actionLabel: "Add South Egress Gate",
      onApply: () => {
        addAnchor({
          name: "Gate 02 — South Egress Portal",
          type: "exit",
          lat: center[0] - 0.006,
          lng: center[1],
          expectedThroughputPerMin: 1200,
          capacity: 35000,
          notes: "Dedicated crowd egress portal",
        });
      },
    });
  }

  // Check 2: Medical Coverage
  const medicalAsset = assets.find((a) => a.type === "medical" || a.type === "first_aid");
  if (!medicalAsset) {
    issues.push({
      id: "gap-medical",
      title: "No Emergency Medical Unit Placed",
      severity: "critical",
      description: "The event plan has zero registered medical stations or ambulance posts.",
      actionLabel: "Add Central Medical Station",
      onApply: () => {
        addAsset({
          name: "Central Field Medical Command",
          type: "medical",
          lat: center[0],
          lng: center[1] + 0.003,
          zoneId: zones[0]?.id || "central",
          status: "active",
          coverageRadiusMeters: 400,
          staffCount: 10,
        });
      },
    });
  }

  // Check 3: Emergency Route Corridor
  const emergencyRoute = routes.find((r) => r.type === "emergency" || r.type === "evacuation");
  if (!emergencyRoute) {
    issues.push({
      id: "gap-route",
      title: "No Emergency Response Route Defined",
      severity: "warning",
      description: "Ambulance and security vehicles have no dedicated road corridor to ingress points.",
      actionLabel: "Create Emergency Route",
      onApply: () => {
        addRoute({
          name: "Primary Emergency Access Corridor",
          type: "emergency",
          waypoints: [
            [center[0] + 0.006, center[1]],
            [center[0], center[1]],
            [center[0] - 0.006, center[1]],
          ],
          color: "#ef4444",
          status: "clear",
          isRoutedRoad: true,
        });
      },
    });
  }

  // Check 4: Holding Zone
  if (zones.length < 2) {
    issues.push({
      id: "gap-zone",
      title: "Single Operational Zone Risk",
      severity: "warning",
      description: "Crowd cannot be partitioned effectively without at least two distinct operational zones.",
      actionLabel: "Add North Holding Sector",
      onApply: () => {
        addZone({
          name: "North Spectator Holding Sector",
          code: "ZONE B",
          type: "transit",
          capacity: 25000,
          currentPopulation: 0,
          ingressRatePerMin: 400,
          egressRatePerMin: 250,
          cctvCount: 3,
          fieldTeamCount: 4,
          medicalUnitsCount: 1,
          emergencyAccess: "clear",
          riskLevel: "low",
          boundary: [
            [center[0] + 0.008, center[1] - 0.006],
            [center[0] + 0.008, center[1] + 0.006],
            [center[0] + 0.002, center[1] + 0.006],
            [center[0] + 0.002, center[1] - 0.006],
          ],
          elevationMeters: 10,
        });
      },
    });
  }

  const readinessScore = Math.max(45, 100 - issues.length * 15);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-900 shadow-2xl shadow-indigo-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-indigo-950/20 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Intelligent Plan Readiness Analysis</h3>
              <p className="text-xs text-indigo-300 font-semibold">
                Readiness Score: {readinessScore}% {readinessScore >= 85 ? "Optimal" : "Needs Optimization"}
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {issues.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">All Core Requirements Satisfied!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your spatial event plan contains appropriate operational zones, entry/exit gates, medical command bases, and emergency routes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">
                Found {issues.length} operational missing component{issues.length > 1 ? "s" : ""}:
              </p>

              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {issue.severity === "critical" ? (
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-100">{issue.title}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        issue.severity === "critical"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{issue.description}</p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {onPreviewCandidate && (
                      <button
                        type="button"
                        onClick={() => onPreviewCandidate({ type: issue.id, title: issue.title })}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-400" /> Preview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        issue.onApply();
                        onClose();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                    >
                      {issue.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
