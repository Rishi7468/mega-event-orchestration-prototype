"use client";

import { X, Video, UserCheck, Stethoscope, AlertCircle, Play } from "lucide-react";
import type { OperationalZoneDefinition } from "@/store/eventAuthoringStore";
import type { ZoneSnapshot, VenueGate } from "@/types";

type SelectedZonePanelProps = {
  zone: OperationalZoneDefinition;
  snapshot?: ZoneSnapshot;
  gates: VenueGate[];
  onClose: () => void;
  onRunWhatIf: (zoneId: string) => void;
  onApproveIntervention: (actionLabel: string) => void;
};

export function SelectedZonePanel({
  zone,
  snapshot,
  gates,
  onClose,
  onRunWhatIf,
  onApproveIntervention,
}: SelectedZonePanelProps) {
  const currentPressure = snapshot?.crowdPressure ?? Math.round((zone.currentPopulation / zone.capacity) * 100);
  const isElevated = currentPressure > 70;
  const isCritical = currentPressure > 85;

  // Determine explanation reasons based on state
  const getElevationReasons = () => {
    const reasons: string[] = [];
    if (zone.ingressRatePerMin > zone.egressRatePerMin * 1.5) {
      reasons.push(`Accelerating Inflow: Ingress (${zone.ingressRatePerMin}/min) significantly exceeds Egress (${zone.egressRatePerMin}/min)`);
    }
    if (currentPressure > 80) {
      reasons.push(`Capacity Threshold Exceeded: Operating at ${currentPressure}% of sector design limit (${zone.capacity.toLocaleString()} max)`);
    }
    const gateA = gates.find((g) => g.id === "gate-a");
    if (gateA && gateA.estimatedWaitMinutes > 8) {
      reasons.push(`Primary Gate Bottleneck: Gate A queue wait time elevated to ${gateA.estimatedWaitMinutes} minutes`);
    }
    if (zone.emergencyAccess === "constrained") {
      reasons.push("Emergency Corridor Constrained: Sector egress bottleneck restricting rapid response access");
    }
    if (reasons.length === 0) {
      reasons.push("Normal operational flow within safe sector thresholds");
    }
    return reasons;
  };

  const reasons = getElevationReasons();

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-muted/40">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-accent/20 px-2.5 py-1 text-xs font-mono font-bold text-accent border border-accent/30">
            {zone.code}
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">{zone.name}</h3>
            <span className="text-[11px] text-foreground-muted capitalize">{zone.type} Sector Command</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* Pressure & Population KPI Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-muted/30 p-3.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
              Crowd Pressure
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${
                isCritical ? "text-red-400" : isElevated ? "text-amber-400" : "text-emerald-400"
              }`}>
                {currentPressure}%
              </span>
              <span className="text-[10px] font-medium text-foreground-muted">of capacity</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isCritical ? "bg-red-500" : isElevated ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, currentPressure)}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 p-3.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
              Current Headcount
            </span>
            <div className="text-2xl font-extrabold text-foreground">
              {zone.currentPopulation.toLocaleString()}
            </div>
            <span className="text-[10px] text-foreground-muted block mt-1">
              Max: {zone.capacity.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Operational Metrics Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-border bg-surface p-2.5">
            <span className="text-[10px] text-foreground-muted block">Ingress</span>
            <span className="font-bold text-foreground">{zone.ingressRatePerMin}/m ↑</span>
          </div>
          <div className="rounded-xl border border-border bg-surface p-2.5">
            <span className="text-[10px] text-foreground-muted block">Egress</span>
            <span className="font-bold text-foreground">{zone.egressRatePerMin}/m ↓</span>
          </div>
          <div className="rounded-xl border border-border bg-surface p-2.5">
            <span className="text-[10px] text-foreground-muted block">Field Units</span>
            <span className="font-bold text-emerald-400">{zone.fieldTeamCount} Teams</span>
          </div>
        </div>

        {/* WHY IS THIS ZONE ELEVATED? Section */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>WHY IS THIS ZONE ELEVATED?</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-200/90 pl-1">
            {reasons.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resource Allocation Summary */}
        <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
            Sector Resource Infrastructure
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <Video className="h-3.5 w-3.5 text-blue-400" />
              <span>{zone.cctvCount} CCTV Feeds</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{zone.fieldTeamCount} Officers</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <Stethoscope className="h-3.5 w-3.5 text-pink-400" />
              <span>{zone.medicalUnitsCount} Medics</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: WHAT-IF SIMULATION & APPLY INTERVENTION */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => onRunWhatIf(zone.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all"
          >
            <Play className="h-4 w-4" /> Run &ldquo;What-If?&rdquo; Simulation Scenario
          </button>

          <button
            type="button"
            onClick={() => onApproveIntervention("Redirect Central Inflow to Gate B")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-all"
          >
            Execute Direct Intervention →
          </button>
        </div>
      </div>
    </div>
  );
}
