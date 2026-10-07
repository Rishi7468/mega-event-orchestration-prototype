"use client";

import { useState } from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { EventPlanObjectTreePanel } from "./EventPlanObjectTreePanel";
import { ObjectInspectorPanel } from "./ObjectInspectorPanel";
import {
  Layers,
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  Zap,
  Radio,
  Ambulance,
} from "lucide-react";
import { EVENT_PRESETS } from "@/data/eventPresets";

export type RightPanelTab = "structure" | "inspector" | "readiness" | "presets" | "twin";

type RightContextPanelProps = {
  activeTab: RightPanelTab;
  setActiveTab: (tab: RightPanelTab) => void;
  selectedObjectType: string | null;
  selectedObjectId: string | null;
  onOpenQuestionnaire: () => void;
  onOpenWhatsMissingModal: () => void;
  onOpenFootageDrawer?: () => void;
  onOpenSourceRegistry?: () => void;
};

export function RightContextPanel({
  activeTab,
  setActiveTab,
  selectedObjectType,
  selectedObjectId,
  onOpenQuestionnaire,
  onOpenWhatsMissingModal,
  onOpenFootageDrawer,
  onOpenSourceRegistry,
}: RightContextPanelProps) {
  const {
    eventType,
    isRegionConfirmed,
    draftPlan,
    applyDraftPlan,
    setDraftPlan,
    loadPreset,
    spatialHealthReport,
    evaluateSpatialHealth,
    zones,
    anchors,
    routes,
    assets,
    sensors,
    landmarks,
    mobileAssets,
    interventions,
    approveIntervention,
  } = useEventAuthoringStore() as any;

  const healthReport = spatialHealthReport || (evaluateSpatialHealth ? evaluateSpatialHealth() : null);
  const scorePercent = healthReport ? Math.round(healthReport.score) : 0;
  const criticalCount = healthReport ? healthReport.warnings.filter((w: any) => w.severity === "critical").length : 0;
  const pendingInterventions = (interventions || []).filter((i: any) => i.status === "pending");

  return (
    <div className="w-80 lg:w-96 flex flex-col rounded-2xl border border-border bg-surface shadow-xl overflow-hidden h-[calc(100vh-180px)] min-h-125">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-border bg-surface-muted/60 p-1.5 font-mono text-xs font-bold gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("twin")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === "twin"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Twin</span>
        </button>

        <button
          onClick={() => setActiveTab("structure")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === "structure"
              ? "bg-primary text-black shadow-xs"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Tree</span>
        </button>

        <button
          onClick={() => setActiveTab("inspector")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === "inspector"
              ? "bg-primary text-black shadow-xs"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Inspect</span>
        </button>

        <button
          onClick={() => setActiveTab("readiness")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === "readiness"
              ? "bg-primary text-black shadow-xs"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Health</span>
        </button>

        <button
          onClick={() => setActiveTab("presets")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeTab === "presets"
              ? "bg-primary text-black shadow-xs"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Plan</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* DIGITAL TWIN & AI INTERVENTIONS TAB */}
        {activeTab === "twin" && (
          <div className="space-y-4 text-xs font-sans">
            {/* Action Bar for Footage Analysis & Data Registry */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenFootageDrawer}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 font-mono font-bold text-purple-300 hover:bg-purple-500/20 transition-all text-[11px]"
              >
                📹 FOOTAGE ANALYSIS
              </button>
              <button
                type="button"
                onClick={onOpenSourceRegistry}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all text-[11px]"
              >
                📡 DATA SOURCES
              </button>
            </div>

            {/* Live AI Interventions Banner */}
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-200 uppercase flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
                  Live AI Interventions
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40">
                  {pendingInterventions.length} Actionable
                </span>
              </div>

              {pendingInterventions.length === 0 ? (
                <p className="text-[11px] text-purple-300/70 font-mono">
                  All sectors operating within normal crowd thresholds. AI engine monitoring CCTV telemetry.
                </p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {pendingInterventions.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-purple-500/50 bg-slate-950/90 space-y-2.5 shadow-md"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-purple-300">{item.title || "Crowd Density Alert"}</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold uppercase border border-red-500/30">
                          {item.riskLevel || item.severity || "HIGH"}
                        </span>
                      </div>
                      <p className="text-foreground leading-snug font-mono text-[11px]">
                        {item.description || item.recommendationText}
                      </p>

                      {/* DATA FLOW & EVIDENCE PROVENANCE BREAKDOWN */}
                      <div className="rounded-lg border border-border/60 bg-surface-muted/60 p-2 space-y-1.5 font-mono text-[10px]">
                        <div className="text-foreground-muted font-bold text-[9px] uppercase tracking-wider">
                          EVIDENCE & DATA FLOW PIPELINE
                        </div>
                        <div className="text-cyan-300 font-bold">
                          1. CCTV-04 (YOLO v8) → Count: 6,420 (94% confidence)
                        </div>
                        <div className="text-amber-300 font-bold">
                          2. Zone North → 87% Occupancy (Breach in ~9 mins)
                        </div>
                        <div className="text-emerald-400 font-bold">
                          3. Recommended Action → Reroute 30% flow to Gate B
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => approveIntervention(item.id)}
                          className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold shadow-md text-[11px] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-purple-200" />
                          [ APPROVE & EXECUTE DIVERSION ]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sensor Network Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-foreground-muted">
                  <Radio className="h-3.5 w-3.5 text-purple-400" /> Sensor Network ({sensors?.length || 0})
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(sensors || []).map((s: any) => (
                  <div
                    key={s.id}
                    className="p-2 rounded-lg border border-border bg-surface-muted/40 flex items-center justify-between font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">📹</span>
                      <span className="font-bold text-foreground">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground-muted">{s.peopleCount} detected</span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          s.status === "active" ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Asset Units */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-foreground-muted">
                  <Ambulance className="h-3.5 w-3.5 text-amber-400" /> Mobile Assets ({mobileAssets?.length || 0})
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(mobileAssets || []).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg border border-border bg-surface-muted/40 flex items-center justify-between font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.type.includes("medical") ? "🚑" : "🚔"}</span>
                      <span className="font-bold text-foreground">{m.name}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        m.status === "responding"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* STRUCTURE TAB */}
        {activeTab === "structure" && (
          <EventPlanObjectTreePanel
            onSelectObject={(type, id) => {
              if (type && id) setActiveTab("inspector");
            }}
          />
        )}

        {/* INSPECTOR TAB */}
        {activeTab === "inspector" && (
          <ObjectInspectorPanel
            selectedObjectType={selectedObjectType as any}
            selectedObjectId={selectedObjectId}
            onClose={() => setActiveTab("structure")}
          />
        )}

        {/* READINESS TAB */}
        {activeTab === "readiness" && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-foreground uppercase">
                  Plan Readiness Score
                </span>
                <span className="text-xl font-bold font-mono text-primary">
                  {scorePercent}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground-muted font-mono leading-tight">
                Evaluates ingress capacity, emergency corridor clearance, medical coverage, and security post density.
              </p>
            </div>

            {/* Quick Action Button for What's Missing */}
            <button
              onClick={onOpenWhatsMissingModal}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono font-bold hover:bg-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>WHAT&apos;S MISSING?</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {criticalCount} Issues
              </span>
            </button>

            {/* Spatial Health Metrics */}
            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between">
                <span className="text-foreground-muted">Sector Count</span>
                <span className="font-bold text-foreground">{zones.length}</span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between">
                <span className="text-foreground-muted">Ingress Gates</span>
                <span className="font-bold text-foreground">{anchors.length}</span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between">
                <span className="text-foreground-muted">Emergency Corridors</span>
                <span className="font-bold text-foreground">{routes.length}</span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-surface-muted/30 flex items-center justify-between">
                <span className="text-foreground-muted">Resource Units</span>
                <span className="font-bold text-emerald-400">{assets.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* PRESETS TAB */}
        {activeTab === "presets" && (
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-2">
              <button
                onClick={onOpenQuestionnaire}
                disabled={!isRegionConfirmed}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                  !isRegionConfirmed
                    ? "border border-border bg-surface-muted text-foreground-muted/40 cursor-not-allowed"
                    : "bg-primary text-black hover:bg-primary-hover shadow-primary/20"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>START EVENT QUESTIONNAIRE</span>
              </button>

              {!isRegionConfirmed && (
                <p className="text-[10px] text-amber-400 font-mono text-center">
                  ⚠️ Define and confirm the event region first to unlock presets.
                </p>
              )}
            </div>

            {/* Active Draft Operational Plan Preview */}
            {draftPlan && (
              <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground uppercase">
                    DRAFT OPERATIONAL PLAN
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold border border-primary/30">
                    {draftPlan.confidenceScorePercent}% Coverage
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-foreground-muted">
                  <p>✓ {draftPlan.candidateZones.length} Zone Sectors</p>
                  <p>✓ {draftPlan.candidateAnchors.length} Ingress & Egress Gates</p>
                  <p>✓ {draftPlan.candidateRoutes.length} Corridors</p>
                  <p>✓ {draftPlan.candidateAssets.length} Medical & Security Assets</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setDraftPlan(null)}
                    className="flex-1 py-1.5 rounded-lg border border-border bg-surface text-foreground-muted hover:text-foreground font-mono font-bold"
                  >
                    DISCARD
                  </button>
                  <button
                    onClick={() => applyDraftPlan()}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-black font-mono font-bold hover:bg-primary-hover shadow-sm"
                  >
                    APPLY PLAN
                  </button>
                </div>
              </div>
            )}

            {/* Standard Archetype Presets List */}
            <div className="space-y-2">
              <h4 className="font-mono font-bold text-xs text-foreground-muted uppercase">
                PROVEN OPERATIONAL PATTERNS
              </h4>
              <div className="space-y-2">
                {EVENT_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset.id)}
                    disabled={!isRegionConfirmed}
                    className={`w-full p-3 rounded-xl border text-left transition-all font-mono ${
                      !isRegionConfirmed
                        ? "border-border/40 bg-surface-muted/20 opacity-50 cursor-not-allowed"
                        : "border-border bg-surface-muted/30 hover:border-border-strong hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                        {preset.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-muted font-sans mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
