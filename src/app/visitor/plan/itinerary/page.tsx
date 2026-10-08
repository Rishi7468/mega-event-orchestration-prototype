"use client";

import { useState } from "react";
import {
  Clock,
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Button, Card, Chip, SectionHeading } from "@/components/shared";
import { VisitorPageHeader } from "@/components/visitor";
import { mahaKumbhLandmarks } from "@/data/landmarks";
import { zones } from "@/data/zones";
import { useSimulationStore } from "@/store/simulationStore";

const TIME_OPTIONS = [
  { label: "1 Hour", value: 60 },
  { label: "2 Hours", value: 120 },
  { label: "4 Hours", value: 240 },
  { label: "6 Hours", value: 360 },
];

export default function MultiStopItineraryPage() {
  const activeItinerary = useSimulationStore((state) => state.activeItinerary);
  const buildMultiStopItinerary = useSimulationStore((state) => state.buildMultiStopItinerary);
  const acceptItineraryReorder = useSimulationStore((state) => state.acceptItineraryReorder);
  const dismissItineraryReorder = useSimulationStore((state) => state.dismissItineraryReorder);

  const [startZoneId, setStartZoneId] = useState<string>(activeItinerary?.startZoneId ?? "south");
  const [availableTime, setAvailableTime] = useState<number>(activeItinerary?.availableTimeMinutes ?? 240);
  const [selectedLandmarks, setSelectedLandmarks] = useState<string[]>(
    activeItinerary?.selectedLandmarkIds ?? ["sangam", "temple", "cultural", "food-market"]
  );
  const [preferences, setPreferences] = useState(
    activeItinerary?.preferences ?? {
      avoidCrowds: false,
      minimizeWalking: false,
      maximizeAttractions: true,
    }
  );

  const toggleLandmark = (id: string) => {
    const updated = selectedLandmarks.includes(id)
      ? selectedLandmarks.filter((l) => l !== id)
      : [...selectedLandmarks, id];
    setSelectedLandmarks(updated);
  };

  const handleOptimize = () => {
    buildMultiStopItinerary(startZoneId, availableTime, selectedLandmarks, preferences);
  };

  const result = activeItinerary?.result;

  return (
    <div>
      <VisitorPageHeader
        title="Multi-Stop Optimizer"
        subtitle="Dynamic time-budgeted sequence planning under live crowd conditions"
        backHref="/visitor/plan"
      />

      <div className="space-y-5">
        {/* LIVE REORDER CONFIRMATION BANNER */}
        {activeItinerary?.reorderAvailable && activeItinerary.pendingResult && (
          <Card className="border-amber-500/60 bg-amber-950/30 p-4 shadow-xl animate-pulse-subtle">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ⚡ Live Itinerary Reorder Offered
                  </span>
                  <Chip tone="warning">Crowd Escalation</Chip>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {activeItinerary.reorderReason}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  New Recommended Order:{" "}
                  <span className="font-bold text-foreground">
                    {activeItinerary.pendingResult.stops.map((s) => s.name).join(" → ")}
                  </span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-bold"
                    onClick={acceptItineraryReorder}
                  >
                    Accept New Order
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 border-border/60 text-foreground-muted"
                    onClick={dismissItineraryReorder}
                  >
                    Keep Original Order
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* INPUT CONTROLS CARD */}
        <Card className="p-4 space-y-4">
          <SectionHeading title="1. Configure Your Journey Inputs" />

          {/* Starting Zone */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Starting Location / Zone
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setStartZoneId(zone.id)}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                    startZoneId === zone.id
                      ? "border-accent bg-accent/10 text-foreground font-semibold"
                      : "border-border bg-surface-muted text-foreground-muted hover:border-border/80"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="truncate">{zone.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Available Time Budget */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Available Time Budget
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvailableTime(opt.value)}
                  className={`rounded-lg border py-2 text-center text-xs transition-colors ${
                    availableTime === opt.value
                      ? "border-accent bg-accent/10 text-foreground font-bold"
                      : "border-border bg-surface-muted text-foreground-muted hover:border-border/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desired Destinations */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Select Desired Destinations ({selectedLandmarks.length} selected)
            </label>
            <div className="mt-1.5 space-y-2">
              {mahaKumbhLandmarks.map((landmark) => {
                const checked = selectedLandmarks.includes(landmark.id);
                return (
                  <div
                    key={landmark.id}
                    onClick={() => toggleLandmark(landmark.id)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-colors ${
                      checked
                        ? "border-accent/60 bg-surface-muted text-foreground"
                        : "border-border/50 text-foreground-muted opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border"
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{landmark.name}</p>
                        <p className="text-[11px] text-foreground-muted">
                          {landmark.zoneId.toUpperCase()} Zone · ~{landmark.estimatedDwellMinutes}m visit
                        </p>
                      </div>
                    </div>
                    <Chip tone="neutral">{landmark.category}</Chip>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Optimization Preferences
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setPreferences((p) => ({ ...p, avoidCrowds: !p.avoidCrowds }))
                }
                className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                  preferences.avoidCrowds
                    ? "border-accent bg-accent/10 text-foreground font-semibold"
                    : "border-border text-foreground-muted"
                }`}
              >
                Avoid Crowds
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreferences((p) => ({ ...p, minimizeWalking: !p.minimizeWalking }))
                }
                className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                  preferences.minimizeWalking
                    ? "border-accent bg-accent/10 text-foreground font-semibold"
                    : "border-border text-foreground-muted"
                }`}
              >
                Minimize Walking
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreferences((p) => ({ ...p, maximizeAttractions: !p.maximizeAttractions }))
                }
                className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                  preferences.maximizeAttractions
                    ? "border-accent bg-accent/10 text-foreground font-semibold"
                    : "border-border text-foreground-muted"
                }`}
              >
                Max Attractions
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full bg-accent text-accent-foreground font-bold h-11"
            onClick={handleOptimize}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Optimized Itinerary
          </Button>
        </Card>

        {/* RESULTS CARD */}
        {result && (
          <Card className="p-4 space-y-4 border-accent/30">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  YOUR OPTIMIZED ITINERARY
                </p>
                <p className="text-base font-bold text-foreground">
                  {result.fittedCount} Stops · ~{result.totalDurationMinutes} min total
                </p>
              </div>
              <Chip tone="positive">Score: {result.overallScore}</Chip>
            </div>

            {/* Time Constraint Advisory */}
            {result.fittedCount < result.totalRequestedCount && (
              <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 text-xs text-amber-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Notice:</strong> {result.fittedCount} of {result.totalRequestedCount}{" "}
                  destinations fit within your {availableTime} min budget.
                </span>
              </div>
            )}

            {/* Sequence List */}
            <ol className="space-y-3">
              {result.stops.map((stop) => {
                const isCritical = stop.crowdLevel === "CRITICAL" || stop.crowdLevel === "HIGH";
                return (
                  <li
                    key={stop.landmarkId}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                      {stop.stepNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">{stop.name}</p>
                        <Chip tone={isCritical ? "warning" : "positive"}>
                          {stop.crowdLevel} crowd
                        </Chip>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-foreground-muted" />
                          {stop.estimatedArrival} – {stop.estimatedDeparture}
                        </span>
                        <span>Visit: {stop.dwellMinutes}m</span>
                        <span>Queue: ~{stop.expectedWaitMinutes}m</span>
                      </div>

                      {stop.legFromPrevious && (
                        <p className="mt-1 text-[11px] text-foreground-muted/90 font-mono">
                          Leg from previous: {stop.legFromPrevious.name} ({stop.legFromPrevious.effectiveEtaMinutes} min · {stop.legFromPrevious.distanceMeters}m)
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Why This Order Explanation Box */}
            <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-accent" /> Why this order?
              </p>
              <p className="text-xs leading-relaxed text-foreground-muted">
                {result.explanation}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
