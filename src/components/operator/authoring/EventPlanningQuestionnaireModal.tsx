"use client";

import { useState } from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { QuestionnaireEngine } from "@/lib/intelligence/questionnaireEngine";
import type { EventQuestionnaireAnswers } from "@/types/eventPlan";
import {
  Sparkles,
  Users,
  ShieldAlert,
  Sliders,
  ChevronRight,
  X,
  CheckCircle2,
  ArrowRight,
  Navigation,
  Crosshair,
  Building,
} from "lucide-react";

type EventPlanningQuestionnaireModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: () => void;
};

export function EventPlanningQuestionnaireModal({
  isOpen,
  onClose,
  onGeneratePlan,
}: EventPlanningQuestionnaireModalProps) {
  const { eventType, expectedAttendance, regionPolygon, saveQuestionnaireAnswers, setDraftPlan } =
    useEventAuthoringStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [answers, setAnswers] = useState<EventQuestionnaireAnswers>(() =>
    QuestionnaireEngine.getDefaultAnswers(eventType, expectedAttendance)
  );

  if (!isOpen) return null;

  const handleFinish = () => {
    saveQuestionnaireAnswers(answers);
    const draft = QuestionnaireEngine.generateDraftPlan(regionPolygon, eventType, answers);
    setDraftPlan(draft);
    onGeneratePlan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-muted/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-mono tracking-tight">
                OPERATIONAL QUESTIONNAIRE
              </h2>
              <p className="text-xs text-foreground-muted font-mono">
                Step {step} of 3 — {step === 1 ? "Scale & Throughput" : step === 2 ? "Access & Logistics" : "Security & Conditions"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans space-y-6">
          {/* STEP 1: SCALE & THROUGHPUT */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-foreground font-mono">
                  EVENT SCALE & THROUGHPUT
                </h3>
                <p className="text-xs text-foreground-muted mt-1">
                  Specify expected attendance and peak flow rates to scale ingress sectors and emergency egress widths.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Expected Attendance
                  </label>
                  <input
                    type="number"
                    value={answers.expectedAttendance}
                    onChange={(e) =>
                      setAnswers({ ...answers, expectedAttendance: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={answers.durationHours}
                    onChange={(e) =>
                      setAnswers({ ...answers, durationHours: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Peak Arrival Rate (/Hour)
                  </label>
                  <input
                    type="number"
                    value={answers.peakArrivalRatePerHour}
                    onChange={(e) =>
                      setAnswers({ ...answers, peakArrivalRatePerHour: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Peak Departure Rate (/Hour)
                  </label>
                  <input
                    type="number"
                    value={answers.peakDepartureRatePerHour}
                    onChange={(e) =>
                      setAnswers({ ...answers, peakDepartureRatePerHour: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-mono text-xs font-bold text-black hover:bg-primary-hover shadow-md transition-all"
              >
                <span>NEXT: ACCESS & LOGISTICS</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ACCESS & LOGISTICS */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-foreground font-mono">
                  ACCESS & LOGISTICS REQUIREMENTS
                </h3>
                <p className="text-xs text-foreground-muted mt-1">
                  Configure entrance gates, emergency exits, and medical stations required across the site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Main Entrance Gates Required
                  </label>
                  <input
                    type="number"
                    value={answers.entranceCount}
                    onChange={(e) => setAnswers({ ...answers, entranceCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Emergency Exit Gates Required
                  </label>
                  <input
                    type="number"
                    value={answers.emergencyExitCount}
                    onChange={(e) =>
                      setAnswers({ ...answers, emergencyExitCount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Medical Posts Required
                  </label>
                  <input
                    type="number"
                    value={answers.medicalPostsRequired}
                    onChange={(e) =>
                      setAnswers({ ...answers, medicalPostsRequired: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-1">
                    Security Screening Checkpoints
                  </label>
                  <input
                    type="number"
                    value={answers.securityCheckpointsRequired}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        securityCheckpointsRequired: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-muted/30 cursor-pointer font-mono text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={answers.vipAccessRequired}
                    onChange={(e) => setAnswers({ ...answers, vipAccessRequired: e.target.checked })}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>VIP Access Corridor</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-muted/30 cursor-pointer font-mono text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={answers.parkingRequired}
                    onChange={(e) => setAnswers({ ...answers, parkingRequired: e.target.checked })}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>Parking Logistics</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-muted/30 cursor-pointer font-mono text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={answers.transitInterfaceRequired}
                    onChange={(e) =>
                      setAnswers({ ...answers, transitInterfaceRequired: e.target.checked })
                    }
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>Transit Interface</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-xl border border-border bg-surface text-foreground-muted hover:text-foreground font-mono text-xs font-bold"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-mono text-xs font-bold text-black hover:bg-primary-hover shadow-md transition-all"
                >
                  <span>NEXT: CONDITIONS & RISK</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONDITIONS & RISK */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-foreground font-mono">
                  SECURITY LEVEL & CROWD CONDITIONS
                </h3>
                <p className="text-xs text-foreground-muted mt-1">
                  Set security threat classification and crowd movement behavior.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-2">
                  Security Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["standard", "elevated", "high", "critical"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAnswers({ ...answers, securityLevel: lvl })}
                      className={`p-3 rounded-xl border text-center font-mono text-xs font-bold uppercase transition-all ${
                        answers.securityLevel === lvl
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-surface-muted/30 text-foreground-muted hover:bg-surface-muted"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-foreground-muted uppercase block mb-2">
                  Expected Crowd Behavior
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["low_movement", "moderate", "high_movement", "very_high_movement"] as const).map((bhv) => (
                    <button
                      key={bhv}
                      type="button"
                      onClick={() => setAnswers({ ...answers, crowdBehavior: bhv })}
                      className={`p-3 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                        answers.crowdBehavior === bhv
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                          : "border-border bg-surface-muted/30 text-foreground-muted hover:bg-surface-muted"
                      }`}
                    >
                      {bhv.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 rounded-xl border border-border bg-surface text-foreground-muted hover:text-foreground font-mono text-xs font-bold"
                >
                  ← BACK
                </button>

                <button
                  onClick={handleFinish}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-xs font-bold text-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>ANALYZE REGION & GENERATE DRAFT PLAN</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
