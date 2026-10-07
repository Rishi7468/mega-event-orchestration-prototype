"use client";

import { useState } from "react";
import {
  X,
  Layers,
  MapPin,
  Sliders,
  RefreshCw,
  CheckCircle2,
  Info,
  Split,
  ShieldAlert,
} from "lucide-react";
import { useEventAuthoringStore, type EventType } from "@/store/eventAuthoringStore";

type Tab = "event" | "region" | "zones" | "intelligence";

type EventAuthoringModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function EventAuthoringModal({ isOpen, onClose }: EventAuthoringModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("event");

  const {
    eventName,
    eventType,
    expectedAttendance,
    eventDate,
    eventDurationHours,
    regionPolygon,
    isRegionDefined,
    zones,
    intelligenceFactors = [
      { id: "crowd_density", name: "Crowd Density Telemetry", description: "Real-time camera headcount ratio vs design capacity", status: "active", weight: 9 },
      { id: "weather_factor", name: "Weather & Heat Index", description: "Configured ambient temperature impact on hydration stations", status: "simulated", weight: 6 },
      { id: "ingress_flow", name: "Gate Flow Velocity", description: "Flow rate per minute at entry turnstiles", status: "active", weight: 8 },
    ],
    createEvent,
    setRegionPolygon,
    clearRegionPolygon,
    generateOperationalZones,
    updateZone,
    splitZone,
    resetEventAuthoring,
  } = useEventAuthoringStore() as any;

  const [formName, setFormName] = useState(eventName);
  const [formType, setFormType] = useState<EventType>(eventType);
  const [formAttendance, setFormAttendance] = useState(expectedAttendance);
  const [formDate, setFormDate] = useState(eventDate);
  const [formDuration, setFormDuration] = useState(eventDurationHours);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(zones[0]?.id ?? null);

  if (!isOpen) return null;

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent({
      name: formName,
      type: formType,
      attendance: Number(formAttendance),
      date: formDate,
      duration: Number(formDuration),
    });
    generateOperationalZones();
    setActiveTab("region");
  };

  const selectedZone = (zones as any[]).find((z: any) => z.id === selectedZoneId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Event & Spatial Region Authoring</h2>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-semibold text-accent border border-accent/30 uppercase tracking-wider">
                  Configured Mode
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Define mega-event operating boundary, propose spatial zones, and configure intelligence inputs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface px-6">
          <button
            type="button"
            onClick={() => setActiveTab("event")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === "event"
                ? "border-accent text-accent"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Sliders className="h-4 w-4" />
            1. Event Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("region")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === "region"
                ? "border-accent text-accent"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <MapPin className="h-4 w-4" />
            2. Region Boundary {isRegionDefined && "✓"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("zones")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === "zones"
                ? "border-accent text-accent"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            3. Operational Zones ({zones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("intelligence")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === "intelligence"
                ? "border-accent text-accent"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            4. Intelligence Inputs
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface">
          {/* TAB 1: EVENT SETUP */}
          {activeTab === "event" && (
            <form onSubmit={handleSaveEventDetails} className="max-w-2xl space-y-5">
              <div className="rounded-xl border border-border/60 bg-surface-muted/30 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Create or Configure Event</h3>
                <p className="text-xs text-foreground-muted">
                  Provide event baseline parameters to calibrate crowd capacity thresholds and spatial resource distribution.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Event Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                    placeholder="e.g. Maha Kumbh Parv — Phase 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Event Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as EventType)}
                      className="w-full rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="religious">Religious / Pilgrimage Gathering</option>
                      <option value="sports">Major Sporting Event</option>
                      <option value="music_festival">Music Festival / Concert</option>
                      <option value="civic">Civic / Political Assembly</option>
                      <option value="exhibition">Trade Exhibition / Expo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Expected Attendance</label>
                    <input
                      type="number"
                      value={formAttendance}
                      onChange={(e) => setFormAttendance(Number(e.target.value))}
                      required
                      min={1000}
                      className="w-full rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Event Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      required
                      min={1}
                      max={72}
                      className="w-full rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetEventAuthoring}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90"
                >
                  Confirm & Define Region →
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGION BOUNDARY */}
          {activeTab === "region" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-muted/30 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Geographical Operating Region</h3>
                  <p className="text-xs text-foreground-muted">
                    Bounding box coordinates enclosing the mega-event jurisdiction area.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Region Defined (4 Coordinates)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 rounded-xl border border-border p-4 bg-surface-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Region Polygon</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setRegionPolygon([
                          [25.465, 81.845],
                          [25.465, 81.945],
                          [25.37, 81.945],
                          [25.37, 81.845],
                        ])
                      }
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset to Sangam Boundary
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {regionPolygon.map((coord: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-surface border border-border px-3 py-2">
                        <span className="text-foreground-muted">Node {idx + 1}:</span>
                        <span className="text-foreground font-semibold">
                          [{coord[0].toFixed(4)}, {coord[1].toFixed(4)}]
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        generateOperationalZones();
                        setActiveTab("zones");
                      }}
                      className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-md hover:bg-accent/90"
                    >
                      Propose Operational Zones →
                    </button>
                    <button
                      type="button"
                      onClick={clearRegionPolygon}
                      className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/20"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-muted/50 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                      Zoning Generation Rules
                    </h4>
                    <ul className="space-y-2 text-xs text-foreground-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Automatically anchors Central Ghat as Primary Venue Zone
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Extracts North Transit Corridor as high-throughput Ingress Zone
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Allocates East Concourse for parking and overflow staging
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        Designates South Encampment for visitor accommodation
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 rounded-lg bg-amber-950/30 border border-amber-500/30 p-3 text-[11px] text-amber-300 flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-400" />
                    Zoning proposals are generated deterministically based on geography and expected crowd volume.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONAL ZONES */}
          {activeTab === "zones" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Zone List Column */}
              <div className="space-y-3 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Operational Zones ({zones.length})
                  </h3>
                  <button
                    type="button"
                    onClick={generateOperationalZones}
                    className="text-[11px] text-accent hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                </div>

                <div className="space-y-2">
                  {(zones as any[]).map((zone: any) => {
                    const isSelected = zone.id === selectedZoneId;
                    const pressure = Math.round((zone.currentPopulation / zone.capacity) * 100);
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-accent bg-accent/10 shadow-sm"
                            : "border-border bg-surface-muted/30 hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-surface border border-border px-2 py-0.5 text-[10px] font-bold text-foreground font-mono">
                            {zone.code}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              zone.riskLevel === "critical"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : zone.riskLevel === "high"
                                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  : zone.riskLevel === "medium"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {zone.riskLevel}
                          </span>
                        </div>
                        <h4 className="mt-2 text-xs font-bold text-foreground">{zone.name}</h4>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-foreground-muted">
                          <span>Cap: {zone.capacity.toLocaleString()}</span>
                          <span className="font-semibold text-foreground">{pressure}% load</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Zone Detail Column */}
              {selectedZone ? (
                <div className="space-y-4 lg:col-span-2 rounded-xl border border-border bg-surface-muted/20 p-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-accent">{selectedZone.code}</span>
                        <h3 className="text-sm font-bold text-foreground">{selectedZone.name}</h3>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        Type: <span className="capitalize font-medium text-foreground">{selectedZone.type}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => splitZone(selectedZone.id)}
                        className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                        title="Split zone into sub-sectors"
                      >
                        <Split className="h-3.5 w-3.5" /> Split
                      </button>
                    </div>
                  </div>

                  {/* Form fields for editing zone properties */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={selectedZone.name}
                        onChange={(e) => updateZone(selectedZone.id, { name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Design Capacity</label>
                      <input
                        type="number"
                        value={selectedZone.capacity}
                        onChange={(e) => updateZone(selectedZone.id, { capacity: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">CCTV Count</label>
                      <input
                        type="number"
                        value={selectedZone.cctvCount}
                        onChange={(e) => updateZone(selectedZone.id, { cctvCount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Field Team Count</label>
                      <input
                        type="number"
                        value={selectedZone.fieldTeamCount}
                        onChange={(e) => updateZone(selectedZone.id, { fieldTeamCount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Medical Units</label>
                      <input
                        type="number"
                        value={selectedZone.medicalUnitsCount}
                        onChange={(e) => updateZone(selectedZone.id, { medicalUnitsCount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Emergency Access</label>
                      <select
                        value={selectedZone.emergencyAccess}
                        onChange={(e) =>
                          updateZone(selectedZone.id, {
                            emergencyAccess: e.target.value as "clear" | "constrained" | "blocked",
                          })
                        }
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                      >
                        <option value="clear">Clear Access</option>
                        <option value="constrained">Constrained</option>
                        <option value="blocked">Blocked / Restricted</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-border p-8 text-xs text-foreground-muted">
                  Select a zone from the left to view or edit parameters
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTELLIGENCE INPUTS */}
          {activeTab === "intelligence" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-surface-muted/30 p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Configured Intelligence Model Factors</h3>
                  <p className="text-xs text-foreground-muted">
                    Distinctly separates <span className="font-semibold text-amber-400">[SIMULATED / CONFIGURED]</span> input parameters from <span className="font-semibold text-emerald-400">[LIVE SSE]</span> system telemetry.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(intelligenceFactors as any[]).map((factor: any) => (
                  <div key={factor.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/20 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{factor.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            factor.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {factor.status === "active" ? "LIVE SSE" : "SIMULATED / CONFIGURED"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted">{factor.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground-muted">Weight:</span>
                      <span className="font-mono text-xs font-bold text-accent bg-accent/15 px-2.5 py-1 rounded-lg border border-accent/30">
                        {factor.weight} / 10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-surface-muted/50">
          <span className="text-xs text-foreground-muted">
            Configured zone layout will apply across spatial command center visualization layers
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground shadow-lg hover:bg-accent/90"
          >
            Save & Return to Command Center
          </button>
        </div>
      </div>
    </div>
  );
}
