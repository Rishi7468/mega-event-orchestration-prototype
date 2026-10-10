"use client";

import { X, ShieldAlert, FileText } from "lucide-react";
import { CHINNASWAMY_INCIDENT_MANIFEST } from "@/data/sourceManifest";

type SourceManifestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SourceManifestModal({ isOpen, onClose }: SourceManifestModalProps) {
  if (!isOpen) return null;

  const manifest = CHINNASWAMY_INCIDENT_MANIFEST;
  const primarySource = manifest.sources[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-glow/20 text-accent-glow border border-accent-glow/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">{manifest.title}</h2>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                  MANIFEST ID: {manifest.id}
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Documented Evidence, Official Inquiries, and Mathematical Limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Provenance Key Guide */}
          <div className="rounded-xl border border-border/80 bg-surface-muted/30 p-3.5 space-y-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-foreground">
              Data Provenance Taxonomy (Zero-Fabrication Standard)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  REAL SOURCE DATA
                </span>
                <span className="text-foreground-muted">Judicial commission / official report</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                  DERIVED
                </span>
                <span className="text-foreground-muted">Formula applied to source numbers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">
                  REPLAY SIMULATED
                </span>
                <span className="text-foreground-muted">Interpolated demonstration step</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  THRESHOLD TRIGGER
                </span>
                <span className="text-foreground-muted">Deterministic rule output</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                  UNAVAILABLE
                </span>
                <span className="text-foreground-muted">No public sensor record exists</span>
              </div>
            </div>
          </div>

          {/* Primary Reference Citation */}
          {primarySource && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-accent text-xs uppercase tracking-wide">
                  Primary Authoritative Source
                </span>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {primarySource.verifiedStatus}
                </span>
              </div>
              <p className="font-semibold text-foreground text-xs leading-relaxed">
                {primarySource.title}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground-muted pt-1">
                <div>Publisher: <span className="text-foreground font-medium">{primarySource.publisher}</span></div>
                <div>Date: <span className="text-foreground font-medium">{primarySource.date}</span></div>
                <div className="col-span-2">Citation URL: <span className="text-accent-glow font-mono">{primarySource.url}</span></div>
              </div>
              <div className="rounded bg-surface/80 p-2.5 border border-border text-[11px] text-foreground-muted leading-relaxed mt-2">
                <strong className="text-foreground">Official Limitation:</strong> {primarySource.limitations}
              </div>
            </div>
          )}

          {/* Core Quantified Facts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
              <span className="text-[10px] text-foreground-muted uppercase block">Venue Design Capacity</span>
              <span className="text-lg font-bold text-foreground">
                {manifest.designCapacity.value.toLocaleString("en-IN")}
              </span>
              <span className="mt-1 block text-[9px] font-mono text-emerald-400">
                [{manifest.designCapacity.provenance}]
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
              <span className="text-[10px] text-foreground-muted uppercase block">Arriving Crowd (Official Est.)</span>
              <span className="text-lg font-bold text-amber-400">
                {manifest.peakCrowdEstimate.minValue.toLocaleString("en-IN")} – {manifest.peakCrowdEstimate.maxValue.toLocaleString("en-IN")}
              </span>
              <span className="mt-1 block text-[9px] font-mono text-amber-400">
                [{manifest.peakCrowdEstimate.provenance}]
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
              <span className="text-[10px] text-rose-300 uppercase block">Casualties (Inquiry Report)</span>
              <span className="text-lg font-bold text-rose-400">
                {manifest.documentedOutcomes.fatalities} Fatalities, {manifest.documentedOutcomes.injuries}
              </span>
              <span className="mt-1 block text-[9px] font-mono text-rose-400">
                [{manifest.documentedOutcomes.provenance}]
              </span>
            </div>
          </div>

          {/* Missing Evidence & Explicit Disclosures */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <ShieldAlert className="h-4 w-4" />
              <span>EXPLICIT LIMITATIONS & MISSING SENSOR EVIDENCE</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-rose-200/90 pl-1">
              {manifest.unavailabilityNotice.map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documented Replay Milestones Timeline */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-xs text-foreground block">
              Historical Timeline Milestones (5-Minute Accelerated Framework)
            </span>
            <div className="space-y-2">
              {manifest.milestones.map((m) => (
                <div
                  key={m.historicalTime}
                  className="rounded-xl border border-border bg-surface p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent-glow">{m.historicalTime}</span>
                      {m.replaySecond !== null ? (
                        <span className="text-foreground-muted font-mono text-[10px]">
                          (Replay T+{m.replaySecond}s)
                        </span>
                      ) : (
                        <span className="text-foreground-muted font-mono text-[10px]">
                          (Post-Replay Forensic Audit)
                        </span>
                      )}
                      <span className="font-semibold text-foreground">{m.eventStage}</span>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border ${
                      m.provenance === "REAL SOURCE DATA"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    }`}>
                      {m.provenance}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-muted leading-relaxed">
                    {m.sourceFact}
                  </p>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/50 text-foreground-muted">
                    <div>
                      Headcount: <span className="text-foreground font-mono font-semibold">{m.crowdObservation.estimatedHeadcount.toLocaleString("en-IN")}</span> ({m.crowdObservation.densityGrade})
                    </div>
                    <div>
                      PRAVAAH Response: <span className="text-accent-glow font-medium">{m.pravaahResponse.actionTaken}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-surface-muted/30">
          <span className="text-[11px] text-foreground-muted">
            PRAVAAH Data Integrity Engine · Non-Destructive Replay
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-surface px-4 py-1.5 text-xs font-semibold text-foreground border border-border hover:bg-surface-muted"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
}
