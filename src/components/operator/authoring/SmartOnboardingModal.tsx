"use client";

import { useState } from "react";
import { EVENT_ARCHETYPES_CATALOG, type EventArchetypeDefinition } from "@/data/eventTemplates";
import { POPULAR_VENUES, type CatalogLocation } from "@/data/locationCatalog";
import { GeocodingService, type ResolvedLocation } from "@/lib/spatial/geocodingService";
import type { EventType } from "@/store/eventAuthoringStore";
import {
  Sparkles,
  Search,
  MapPin,
  ChevronRight,
  X,
  CheckCircle2,
  ArrowRight,
  Layers,
  Compass,
  AlertCircle,
  Building,
} from "lucide-react";

type SmartOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartEvent: (params: {
    eventType: EventType;
    eventName: string;
    locationName: string;
    center: [number, number];
    useRecommendedPlan: boolean;
    attendance: number;
    durationHours: number;
  }) => void;
};

export function SmartOnboardingModal({
  isOpen,
  onClose,
  onStartEvent,
}: SmartOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedArchetype, setSelectedArchetype] = useState<EventArchetypeDefinition>(
    EVENT_ARCHETYPES_CATALOG[0],
  );

  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("Marine Drive, Mumbai");
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(
    GeocodingService.search("Marine Drive, Mumbai"),
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const [eventNameInput, setEventNameInput] = useState<string>("Mumbai Marathon 2026");
  const [attendanceInput, setAttendanceInput] = useState<number>(35000);
  const [durationInput, setDurationInput] = useState<number>(6);

  if (!isOpen) return null;

  // Handle archetype selection
  const handleSelectArchetype = (arch: EventArchetypeDefinition) => {
    setSelectedArchetype(arch);
    setEventNameInput(`${arch.label.split("/")[0].trim()} Plan`);
    setAttendanceInput(arch.defaultAttendance);
    setDurationInput(arch.defaultDurationHours);
    setStep(2);
  };

  // Handle location search submit
  const handleSearchLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);

    const result = GeocodingService.search(locationSearchQuery);
    if (result) {
      setResolvedLocation(result);
      setSearchError(null);
    } else {
      setResolvedLocation(null);
      setSearchError(`Could not resolve location "${locationSearchQuery}". Try a city (e.g., Manipur, Mumbai, Delhi) or venue.`);
    }
  };

  const handleSelectCatalogVenue = (venue: CatalogLocation) => {
    setLocationSearchQuery(venue.name);
    setResolvedLocation({
      query: venue.name,
      name: venue.name,
      city: `${venue.city}, ${venue.state}`,
      state: venue.state,
      center: venue.center,
      zoom: venue.zoom,
      suggestedPolygon: venue.suggestedPolygon || [],
      boundingBox: venue.boundingBox,
      isExactMatch: true,
    });
    setSearchError(null);
  };

  const handleFinishOnboarding = (useRecommended: boolean) => {
    if (!resolvedLocation) return;
    onStartEvent({
      eventType: selectedArchetype.id,
      eventName: eventNameInput || `${selectedArchetype.label} Event`,
      locationName: resolvedLocation.name,
      center: resolvedLocation.center,
      useRecommendedPlan: useRecommended,
      attendance: attendanceInput,
      durationHours: durationInput,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-muted/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-mono tracking-tight">
                SPATIAL EVENT CREATOR
              </h2>
              <p className="text-xs text-foreground-muted font-mono">
                Step {step} of 3 — {step === 1 ? "Event Archetype" : step === 2 ? "Geography & Location" : "Starting Plan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Step Pills */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold">
              <span className={`px-2.5 py-1 rounded-full ${step === 1 ? "bg-primary text-black" : "bg-surface-muted text-foreground-muted"}`}>
                1. Archetype
              </span>
              <ChevronRight className="h-3 w-3 text-foreground-muted" />
              <span className={`px-2.5 py-1 rounded-full ${step === 2 ? "bg-primary text-black" : "bg-surface-muted text-foreground-muted"}`}>
                2. Location
              </span>
              <ChevronRight className="h-3 w-3 text-foreground-muted" />
              <span className={`px-2.5 py-1 rounded-full ${step === 3 ? "bg-primary text-black" : "bg-surface-muted text-foreground-muted"}`}>
                3. Plan
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {/* STEP 1: WHAT ARE YOU HOSTING? */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground font-mono">
                  WHAT ARE YOU HOSTING?
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Select an event category. Pravaah will tailor starting operational safety, medical, and crowd ingress models.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EVENT_ARCHETYPES_CATALOG.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => handleSelectArchetype(arch)}
                    className={`group relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                      selectedArchetype.id === arch.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                        : "border-border bg-surface-muted/40 hover:bg-surface-muted hover:border-border-strong"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{arch.emoji}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                          ~{arch.defaultAttendance.toLocaleString()} pax
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm font-mono group-hover:text-primary transition-colors">
                        {arch.label}
                      </h4>
                      <p className="text-xs text-foreground-muted mt-1 leading-snug line-clamp-2">
                        {arch.tagline}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-mono font-bold text-primary opacity-80 group-hover:opacity-100">
                      <span>Select Template</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: WHERE IS IT? */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  <span>{selectedArchetype.emoji} {selectedArchetype.label}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground font-mono mt-1">
                  WHERE IS THE EVENT LOCATED?
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Search any city, state, stadium, landmark, or enter exact latitude/longitude coordinates.
                </p>
              </div>

              {/* Event Name & Specs Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border bg-surface-muted/40">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventNameInput}
                    onChange={(e) => setEventNameInput(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                    placeholder="e.g. Mumbai Marathon 2026"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Expected Attendance
                  </label>
                  <input
                    type="number"
                    value={attendanceInput}
                    onChange={(e) => setAttendanceInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={durationInput}
                    onChange={(e) => setDurationInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Location Search Bar */}
              <form onSubmit={handleSearchLocation} className="space-y-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => {
                      setLocationSearchQuery(e.target.value);
                      setSearchError(null);
                    }}
                    placeholder="Search e.g. Manipur, Marine Drive, Palace Grounds, Eden Gardens..."
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-24 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-black hover:bg-primary-hover transition-colors font-mono"
                  >
                    SEARCH
                  </button>
                </div>

                {/* Error Banner if Location Failed */}
                {searchError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
              </form>

              {/* Active Resolved Location Card */}
              {resolvedLocation && (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm font-mono flex items-center gap-2">
                        {resolvedLocation.name}
                        {resolvedLocation.isExactMatch && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            Verified Location
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-foreground-muted font-mono mt-0.5">
                        {resolvedLocation.city} • Lat: {resolvedLocation.center[0].toFixed(4)}, Lng: {resolvedLocation.center[1].toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-mono text-xs font-bold text-black hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    <span>CONFIRM LOCATION</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Popular Venue Starters */}
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground-muted uppercase mb-2 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" /> Popular Venues & Locations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POPULAR_VENUES.slice(0, 8).map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => handleSelectCatalogVenue(venue)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        resolvedLocation?.name === venue.name
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border bg-surface-muted/30 hover:bg-surface-muted text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      <div className="font-bold text-xs font-mono truncate">{venue.name}</div>
                      <div className="text-[10px] text-foreground-muted font-mono">{venue.city}, {venue.state}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HOW DO YOU WANT TO START? */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  <span>{selectedArchetype.emoji} {selectedArchetype.label} • {resolvedLocation?.name}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground font-mono mt-1">
                  HOW DO YOU WANT TO START?
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Choose whether Pravaah generates a recommended starting operational blueprint or begins with a blank map canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RECOMMENDED PLAN CARD */}
                <div className="relative p-6 rounded-2xl border-2 border-primary bg-primary/10 flex flex-col justify-between space-y-4 shadow-xl shadow-primary/10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-black font-mono text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" /> RECOMMENDED
                    </div>
                    <h4 className="text-lg font-bold text-foreground font-mono">
                      [ USE RECOMMENDED PLAN ]
                    </h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Pravaah constructs a recommended operational layout for <strong>{selectedArchetype.label}</strong> at <strong>{resolvedLocation?.name}</strong>, complete with candidate boundaries, medical tents, security gates, CCTV towers, and emergency corridors.
                    </p>
                  </div>

                  <ul className="space-y-1.5 font-mono text-xs text-foreground-muted border-t border-primary/20 pt-3">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Archetype-tuned boundary & sector zones</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Auto-placed medical, gate, and CCTV resources</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Ready for 1-click Pravaah Check & gap optimization</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleFinishOnboarding(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-sm font-bold text-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                  >
                    <span>USE RECOMMENDED PLAN</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* START BLANK CARD */}
                <div className="relative p-6 rounded-2xl border border-border bg-surface-muted/30 flex flex-col justify-between space-y-4 hover:border-border-strong transition-all">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted text-foreground-muted font-mono text-xs font-bold border border-border">
                      <Layers className="h-3.5 w-3.5" /> BLANK CANVAS
                    </div>
                    <h4 className="text-lg font-bold text-foreground font-mono">
                      [ START BLANK ]
                    </h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Start with a clean map canvas centered at <strong>{resolvedLocation?.name}</strong>. Manually draw regions, sectors, and place operational assets from scratch.
                    </p>
                  </div>

                  <ul className="space-y-1.5 font-mono text-xs text-foreground-muted border-t border-border pt-3">
                    <li className="flex items-center gap-2">
                      <Compass className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                      <span>Complete manual spatial design control</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Compass className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                      <span>No pre-placed zones or assets</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleFinishOnboarding(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 font-mono text-sm font-bold text-foreground hover:bg-surface-muted transition-all"
                  >
                    <span>START BLANK</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface-muted/60 px-6 py-3.5 font-mono text-xs font-bold">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              ← BACK TO STEP {step - 1}
            </button>
          ) : (
            <span className="text-foreground-muted">PRAVAAH SPATIAL COMMAND CENTER</span>
          )}

          <div className="text-foreground-muted">
            Pravaah Decision-Support Engine v3.0
          </div>
        </div>
      </div>
    </div>
  );
}
