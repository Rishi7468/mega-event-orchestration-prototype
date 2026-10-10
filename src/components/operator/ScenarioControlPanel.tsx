"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PRESET_SCENARIOS } from "@/lib/simulation/scenarioController";
import { useSimulationStore } from "@/store/simulationStore";
import { broadcastDemoReset } from "@/lib/demoReset";
import type { EventScenario } from "@/types";
import { FastForward, Play, Pause, RotateCcw, Sliders, CheckCircle2, FileText, Clock } from "lucide-react";
import { SourceManifestModal } from "./SourceManifestModal";

export function ScenarioControlPanel() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("arrival-surge");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);

  const resetSimulation = useSimulationStore((state) => state.reset);
  const setReplayMode = useSimulationStore((state) => state.setReplayMode);

  const activeScenario: EventScenario =
    PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? PRESET_SCENARIOS[0];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const applyStep = useCallback((stepIndex: number) => {
    const step = activeScenario.steps[stepIndex];
    if (!step) return;

    // Apply state patch cleanly to existing simulation store
    useSimulationStore.setState(step.patch);

    // If historical scenario, update replay metadata
    if (activeScenario.id === "chinnaswamy-5min-replay") {
      setReplayMode(
        true,
        activeScenario.name,
        step.historicalTimestamp ?? "15:00 IST",
        activeScenario.warningTime,
        activeScenario.projectedPeakTime
      );
    } else {
      setReplayMode(false);
    }
  }, [activeScenario, setReplayMode]);

  const handleStart = () => {
    setIsPlaying(true);
    applyStep(currentStepIndex);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNextStep = () => {
    const nextIdx = Math.min(currentStepIndex + 1, activeScenario.steps.length - 1);
    setCurrentStepIndex(nextIdx);
    applyStep(nextIdx);
    if (nextIdx === activeScenario.steps.length - 1) {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepIndex(0);
    resetSimulation();
    setReplayMode(false);
    broadcastDemoReset();
  };

  useEffect(() => {
    if (isPlaying) {
      const step = activeScenario.steps[currentStepIndex];
      const duration = step?.durationMs ?? 4000;

      timerRef.current = setTimeout(() => {
        if (currentStepIndex < activeScenario.steps.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          applyStep(nextIndex);
        } else {
          setIsPlaying(false);
        }
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, activeScenario, applyStep]);

  const currentStep = activeScenario.steps[currentStepIndex];
  const isComplete = currentStepIndex === activeScenario.steps.length - 1;
  const isChinnaswamy = activeScenario.id === "chinnaswamy-5min-replay";

  return (
    <>
      <div className="rounded-xl border border-accent-glow/30 bg-surface-card/95 p-4 backdrop-blur-md space-y-3 shadow-lg transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent-glow" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              MAHAKUMBH SCENARIO SIMULATOR{" "}
              <span className="text-[10px] text-foreground-muted font-normal">
                (GHAT INFLOW & DIVERSION ENGINE)
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isChinnaswamy && (
              <button
                type="button"
                onClick={() => setIsManifestOpen(true)}
                className="flex items-center gap-1 rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/40 hover:bg-accent/30 transition-colors"
                title="View Source Manifest"
              >
                <FileText className="h-3 w-3" /> View Source Manifest
              </button>
            )}
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-background/80 border border-border/50 text-foreground-muted">
              {isComplete ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Scenario Concluded
                </span>
              ) : isPlaying ? (
                <span className="text-amber-400 font-bold animate-pulse">Running Step {currentStepIndex + 1}/{activeScenario.steps.length}</span>
              ) : (
                "Ready"
              )}
            </span>
          </div>
        </div>

        {/* Selector & Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center text-xs">
          {/* Scenario Selector & Description */}
          <div className="space-y-1">
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setCurrentStepIndex(0);
                setIsPlaying(false);
                if (e.target.value === "chinnaswamy-5min-replay") {
                  setReplayMode(true, "M. Chinnaswamy Stadium Crush", "14:00 IST", "15:15 IST", "15:30 IST");
                } else {
                  setReplayMode(false);
                }
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent-glow"
            >
              {PRESET_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.category.toUpperCase()})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-foreground-muted truncate pl-0.5">
              {activeScenario.description}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 rounded-lg bg-accent-glow hover:bg-accent-glow/90 text-background px-3.5 py-1.5 text-xs font-bold transition-all shadow shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {currentStepIndex > 0
                  ? "Resume"
                  : isChinnaswamy
                  ? "Start Replay"
                  : "Start Simulation"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-background px-3 py-1.5 text-xs font-bold transition-all"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                PAUSE
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={isComplete}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-foreground px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
            >
              <FastForward className="h-3.5 w-3.5" />
              Next Step
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-border/80 bg-surface hover:bg-surface-muted text-foreground-muted hover:text-foreground px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

      {/* Step Progress & Timeline Bar */}
      <div className="space-y-1.5 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-accent-glow">
            {currentStep?.label}
          </span>
          <span className="text-foreground-muted font-mono">
            {currentStepIndex + 1} / {activeScenario.steps.length}
          </span>
        </div>
        {currentStep?.description && (
          <p className="text-[10px] text-foreground-muted italic leading-tight">
            {currentStep.description}
          </p>
        )}

        {/* Progress Dots */}
        <div className="flex gap-1.5 pt-1">
          {activeScenario.steps.map((st, idx) => (
            <div
              key={st.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                applyStep(idx);
              }}
              className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                idx === currentStepIndex
                  ? "bg-accent-glow shadow-sm"
                  : idx < currentStepIndex
                    ? "bg-emerald-500/70"
                    : "bg-border/60 hover:bg-border"
              }`}
              title={st.label}
            />
          ))}
        </div>

        {/* Provenance & Canonical Dataset Disclosure Footer */}
        {currentStep?.provenance && (
          <div className="space-y-1 pt-1 border-t border-border/20">
            <div className="flex items-center justify-between text-[9px] font-mono text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <span>PROVENANCE: <strong className="text-accent-glow font-bold">{currentStep.provenance}</strong></span>
                {currentStep.canonicalRecordId && (
                  <span className="rounded bg-surface px-1 py-0.2 border border-border text-foreground font-mono">
                    [{currentStep.canonicalRecordId}]
                  </span>
                )}
              </div>
              {currentStep.isWarningStep && <span className="text-amber-400 font-bold">[THRESHOLD TRIGGER: 15:15 WARNING]</span>}
              {currentStep.isPeakStep && <span className="text-rose-400 font-bold">[CRITICAL IMPACT: 15:30 PEAK]</span>}
            </div>
            {currentStep.measurementNote && (
              <p className="text-[9px] text-foreground-muted/90 italic font-sans leading-tight">
                {currentStep.measurementNote}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    <SourceManifestModal isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} />
    </>
  );
}
