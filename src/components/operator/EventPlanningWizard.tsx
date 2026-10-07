"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sliders,
  RotateCcw,
  Check,
} from "lucide-react";
import { useEventAuthoringStore, type EventType } from "@/store/eventAuthoringStore";
import { EVENT_PRESETS } from "@/data/eventPresets";
import {
  generateSmartZoningRecommendations,
  evaluateResourceCoverage,
} from "@/lib/intelligence/planningEngine";

type EventPlanningWizardProps = {
  onCompleteAndEnterOperations: () => void;
};

export function EventPlanningWizard({
  onCompleteAndEnterOperations,
}: EventPlanningWizardProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  const {
    eventName,
    eventType,
    expectedAttendance,
    eventDate,
    eventDurationHours,
    regionPolygon,
    zones,
    createEvent,
    loadPreset,
    setRegionPolygon,
    updateZone,
    resetEventAuthoring,
  } = useEventAuthoringStore();

  const [formName, setFormName] = useState<string>(eventName);
  const [formType, setFormType] = useState<EventType>(eventType);
  const [formAttendance, setFormAttendance] = useState<number>(expectedAttendance);
  const [formDate, setFormDate] = useState<string>(eventDate);
  const [formDuration, setFormDuration] = useState<number>(eventDurationHours);

  // Smart Recommendations State
  const smartProposals = generateSmartZoningRecommendations(
    formType,
    formAttendance,
    regionPolygon,
  );

  const { scores: coverageScores, gaps: coverageGaps, overallSystemHealthPercent } =
    evaluateResourceCoverage(zones);

  const handlePresetSelect = (presetId: string) => {
    loadPreset(presetId);
    const preset = EVENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormName(preset.name);
      setFormType(preset.type);
      setFormAttendance(preset.expectedAttendance);
      setFormDate(preset.eventDate);
      setFormDuration(preset.eventDurationHours);
    }
  };

  const handleStep1Save = () => {
    createEvent({
      name: formName,
      type: formType,
      attendance: formAttendance,
      date: formDate,
      duration: formDuration,
    });
    setActiveStep(2);
  };

  const handleApplySmartZoning = () => {
    // Map smart proposals into operational zone definitions
    const newZones = smartProposals.map((prop) => ({
      id: prop.id,
      name: prop.name,
      code: prop.code,
      type: prop.type,
      capacity: prop.capacity,
      currentPopulation: Math.round(prop.capacity * 0.4),
      ingressRatePerMin: Math.round(prop.capacity * 0.01),
      egressRatePerMin: Math.round(prop.capacity * 0.008),
      cctvCount: prop.recommendedCctv,
      fieldTeamCount: prop.recommendedFieldTeams,
      medicalUnitsCount: prop.recommendedMedical,
      emergencyAccess: "clear" as const,
      riskLevel: "low" as const,
      boundary: prop.boundary,
      elevationMeters: 30,
    }));

    useEventAuthoringStore.setState({ zones: newZones });
    setActiveStep(4);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header Bar & Preset Loader */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-3 py-0.5 text-[11px] font-bold text-accent border border-accent/30 uppercase tracking-wider">
              [EVENT PLANNING ENGINE]
            </span>
            <h1 className="text-lg font-bold text-foreground">Generic Mega-Event Setup</h1>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Configure geography, smart zoning proposals, and resource coverage assumptions for any event type.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground-muted mr-1">Load Preset:</span>
          {EVENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className="rounded-xl border border-border bg-surface-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent hover:bg-surface-muted transition-all"
            >
              ⚡ {preset.name.split(" — ")[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={resetEventAuthoring}
            className="rounded-xl border border-border p-2 text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
            title="Reset to Default"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {[
          { num: 1, label: "1. Profile" },
          { num: 2, label: "2. Region" },
          { num: 3, label: "3. Smart Zoning" },
          { num: 4, label: "4. Infrastructure" },
          { num: 5, label: "5. Risk Model" },
          { num: 6, label: "6. Review" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setActiveStep(s.num)}
            className={`flex items-center justify-center rounded-xl p-2.5 text-xs font-bold transition-all ${
              activeStep === s.num
                ? "bg-accent text-accent-foreground shadow-md"
                : activeStep > s.num
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-surface-muted/50 text-foreground-muted hover:bg-surface-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: EVENT PROFILE */}
      {activeStep === 1 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-foreground">Step 1: Event Profile & Parameters</h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Define event category, design attendance limits, and operational timeframe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Event Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Event Category
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as EventType)}
                className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
              >
                <option value="religious">Religious Gathering / Pilgrimage</option>
                <option value="sports">Sports Event / City Marathon</option>
                <option value="music_festival">Music Festival / Concert Bowl</option>
                <option value="civic">Civic Procession / Political Parade</option>
                <option value="exhibition">Trade Exhibition / Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Expected Peak Attendance (Visitors)
              </label>
              <input
                type="number"
                value={formAttendance}
                onChange={(e) => setFormAttendance(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Event Date & Expected Duration (Hours)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="w-24 rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleStep1Save}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              Continue to Region Definition <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DEFINE EVENT REGION */}
      {activeStep === 2 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Step 2: Define Event Operating Region</h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Geographic spatial container bounding the event venue, transit corridors, and security footprint.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
              [GEOGRAPHIC COORDINATES ACTIVE]
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> Polygon Boundary Coords ({regionPolygon.length} Vertices)
              </span>
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
                className="text-xs font-semibold text-accent hover:underline"
              >
                Reset Boundary Box
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
              {regionPolygon.map((pt, idx) => (
                <div key={idx} className="rounded-lg bg-surface p-2 border border-border">
                  Pt {idx + 1}: {pt[0].toFixed(4)}, {pt[1].toFixed(4)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              Proceed to Smart Zoning Recommendation <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SMART OPERATIONAL ZONING */}
      {activeStep === 3 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <h2 className="text-base font-bold text-foreground">
                  Step 3: Smart Operational Zoning Proposal
                </h2>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">
                Deterministic zoning engine proposes sectors based on event type, expected crowd density, and road access.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplySmartZoning}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              <Check className="h-3.5 w-3.5" /> Accept & Apply Recommended Zoning
            </button>
          </div>

          {/* Proposal Rationale Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smartProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent">{proposal.code}</span>
                    <h3 className="text-sm font-bold text-foreground">{proposal.name}</h3>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-bold text-foreground-muted uppercase border border-border">
                    {proposal.type}
                  </span>
                </div>

                <div className="text-xs text-foreground-muted">
                  Capacity: <span className="font-bold text-foreground">{proposal.capacity.toLocaleString()}</span> visitors
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                    Recommendation Rationale:
                  </span>
                  {proposal.rationale.map((r, idx) => (
                    <p key={idx} className="text-xs text-foreground-muted flex items-start gap-1.5">
                      <span className="text-accent">•</span> {r}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              Continue to Infrastructure Mapping <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: MAP CRITICAL INFRASTRUCTURE & COVERAGE GAPS */}
      {activeStep === 4 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Step 4: Infrastructure Mapping & Resource Coverage
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Audit CCTV surveillance, Medical stations, Field officers, and Gate capacity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground-muted">Overall Resource Health:</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-mono font-bold border ${
                  overallSystemHealthPercent >= 75
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {overallSystemHealthPercent}%
              </span>
            </div>
          </div>

          {/* Coverage Gaps Warning List */}
          {coverageGaps.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" /> Configured Coverage Gaps ({coverageGaps.length})
              </div>
              {coverageGaps.map((gap, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-amber-500/20 pt-2">
                  <span className="text-amber-200">{gap.message}</span>
                  <span className="font-semibold text-amber-400">{gap.suggestedAction}</span>
                </div>
              ))}
            </div>
          )}

          {/* Per-Zone Resource Editor Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-foreground-muted uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Design Cap</th>
                  <th className="py-2.5 px-3">CCTV Feeds</th>
                  <th className="py-2.5 px-3">Field Teams</th>
                  <th className="py-2.5 px-3">Medical Units</th>
                  <th className="py-2.5 px-3">Coverage Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {zones.map((z) => {
                  const score = coverageScores.find((s) => s.zoneId === z.id);
                  return (
                    <tr key={z.id} className="hover:bg-surface-muted/40">
                      <td className="py-3 px-3 font-bold text-foreground">
                        {z.code} — {z.name}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] text-foreground-muted">{z.type}</td>
                      <td className="py-3 px-3 font-mono">{z.capacity.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={z.cctvCount}
                          onChange={(e) => updateZone(z.id, { cctvCount: Number(e.target.value) })}
                          className="w-14 rounded-lg border border-border bg-surface-muted px-2 py-1 text-center font-mono font-bold"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={z.fieldTeamCount}
                          onChange={(e) => updateZone(z.id, { fieldTeamCount: Number(e.target.value) })}
                          className="w-14 rounded-lg border border-border bg-surface-muted px-2 py-1 text-center font-mono font-bold"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={z.medicalUnitsCount}
                          onChange={(e) => updateZone(z.id, { medicalUnitsCount: Number(e.target.value) })}
                          className="w-14 rounded-lg border border-border bg-surface-muted px-2 py-1 text-center font-mono font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            (score?.overallScore ?? 100) >= 70
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {score?.overallScore ?? 100}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              Continue to Crowd & Risk Assumptions <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CROWD & RISK MODEL */}
      {activeStep === 5 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-foreground">
              Step 5: Crowd & Risk Forecast Model
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Set planning assumptions for expected arrival spikes, peak hours, and risk thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-accent" /> Expected Peak Inflow Rate
              </span>
              <p className="text-[11px] text-foreground-muted">
                Estimated arrivals at peak hour (2:00 PM - 4:00 PM).
              </p>
              <div className="font-mono text-base font-bold text-accent">
                {Math.round(expectedAttendance * 0.12).toLocaleString()} arrivals/hr
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> High-Risk Density Threshold
              </span>
              <p className="text-[11px] text-foreground-muted">
                Pressure % at which rule engine triggers situation alerts.
              </p>
              <div className="font-mono text-base font-bold text-amber-400">75% Capacity</div>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-400" /> Emergency Buffer Rate
              </span>
              <p className="text-[11px] text-foreground-muted">
                Required unallocated reserve space in emergency zones.
              </p>
              <div className="font-mono text-base font-bold text-emerald-400">15% Capacity Reserve</div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
            >
              Proceed to Final Event Plan Review <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW EVENT PLAN & HANDOFF */}
      {activeStep === 6 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Step 6: Review Event Operating Plan</h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Confirm configured event parameters and transition into the Live Operations Command Center.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> PLAN READY
            </span>
          </div>

          {/* Event Plan Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <span className="text-[10px] text-foreground-muted font-mono uppercase block">Event Name</span>
              <span className="font-bold text-foreground block text-sm mt-0.5">{eventName}</span>
              <span className="text-[11px] text-accent uppercase font-bold mt-1 block">{eventType}</span>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <span className="text-[10px] text-foreground-muted font-mono uppercase block">Attendance Cap</span>
              <span className="font-bold text-foreground block text-sm mt-0.5">{expectedAttendance.toLocaleString()}</span>
              <span className="text-[11px] text-foreground-muted block mt-1">Date: {eventDate}</span>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <span className="text-[10px] text-foreground-muted font-mono uppercase block">Operational Sectors</span>
              <span className="font-bold text-foreground block text-sm mt-0.5">{zones.length} Sectors</span>
              <span className="text-[11px] text-emerald-400 block mt-1 font-semibold">100% Polygon Mapped</span>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <span className="text-[10px] text-foreground-muted font-mono uppercase block">Resource Health</span>
              <span className="font-bold text-foreground block text-sm mt-0.5">{overallSystemHealthPercent}%</span>
              <span className="text-[11px] text-amber-400 block mt-1 font-semibold">{coverageGaps.length} Gaps Audited</span>
            </div>
          </div>

          {/* Handoff CTA */}
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to Orchestrate?</h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Transition configured plan into Live Operations Command Center with real-time SSE telemetry & deterministic simulation triggers.
              </p>
            </div>
            <button
              type="button"
              onClick={onCompleteAndEnterOperations}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
            >
              <Sparkles className="h-4 w-4" /> [ENTER LIVE OPERATIONS COMMAND CENTER]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
