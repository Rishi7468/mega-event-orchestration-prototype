"use client";

import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Stethoscope, TrafficCone, UserCheck } from "lucide-react";
import { OperatorPanel } from "./OperatorPanel";
import { zones } from "@/data";
import type { IncidentType } from "@/types";
import { useSimulationStore } from "@/store/simulationStore";

const incidentIcons: Record<IncidentType, typeof AlertTriangle> = {
  crowd: AlertTriangle,
  medical: Stethoscope,
  traffic: TrafficCone,
  security: ShieldAlert,
};

const severityStyles = {
  low: "bg-surface-muted text-foreground-muted",
  medium: "bg-risk-moderate-bg text-risk-moderate",
  high: "bg-risk-high-bg text-risk-high",
  critical: "bg-risk-critical-bg text-risk-critical",
};

const statusStyles = {
  open: "bg-risk-critical-bg text-risk-critical border-risk-critical/30",
  responding: "bg-risk-moderate-bg text-risk-moderate border-risk-moderate/30",
  resolved: "bg-risk-low-bg text-risk-low border-risk-low/30",
};

export function IncidentPanel() {
  const incidents = useSimulationStore((state) => state.incidents);
  const acknowledgeIncident = useSimulationStore((state) => state.acknowledgeIncident);
  const resolveIncident = useSimulationStore((state) => state.resolveIncident);
  const addIncident = useSimulationStore((state) => state.addIncident);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  return (
    <OperatorPanel
      title={`Active Incidents (${activeIncidents.length})`}
      action={
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() =>
              addIncident({
                type: "medical",
                zoneId: "central",
                severity: "high",
                status: "open",
                description: "Medical distress reported near Sangam main bathing ghat.",
              })
            }
            className="rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-surface-muted"
          >
            + Medical
          </button>
          <button
            type="button"
            onClick={() =>
              addIncident({
                type: "security",
                zoneId: "north",
                severity: "medium",
                status: "open",
                description: "Security check required at North Transit Hub platform.",
              })
            }
            className="rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-surface-muted"
          >
            + Security
          </button>
        </div>
      }
    >
      {incidents.length === 0 ? (
        <p className="text-xs text-foreground-muted">No active or historical incidents reported.</p>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => {
            const Icon = incidentIcons[inc.type] ?? AlertTriangle;
            const zoneName = zones.find((z) => z.id === inc.zoneId)?.name ?? inc.zoneId;

            return (
              <div
                key={inc.id}
                className="rounded-lg border border-border bg-surface-muted p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-foreground" />
                    <span className="font-semibold uppercase tracking-wide text-foreground">
                      {inc.type} Incident
                    </span>
                    <span className="text-foreground-muted">· {zoneName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${severityStyles[inc.severity]}`}>
                      {inc.severity}
                    </span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[inc.status]}`}>
                      {inc.status}
                    </span>
                  </div>
                </div>

                <p className="mt-2 leading-relaxed text-foreground-muted">{inc.description}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-foreground-muted">ID: {inc.id}</span>
                  <div>
                    {inc.status === "open" && (
                      <button
                        type="button"
                        onClick={() => acknowledgeIncident(inc.id)}
                        className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-1 text-[11px] font-medium text-foreground hover:bg-surface-muted"
                      >
                        <Clock className="h-3 w-3 text-risk-moderate" />
                        Acknowledge & Respond
                      </button>
                    )}
                    {inc.status === "responding" && (
                      <button
                        type="button"
                        onClick={() => resolveIncident(inc.id)}
                        className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-1 text-[11px] font-medium text-foreground hover:bg-surface-muted"
                      >
                        <UserCheck className="h-3 w-3 text-risk-low" />
                        Mark Resolved
                      </button>
                    )}
                    {inc.status === "resolved" && (
                      <span className="flex items-center gap-1 text-[11px] text-risk-low font-medium">
                        <CheckCircle className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OperatorPanel>
  );
}
