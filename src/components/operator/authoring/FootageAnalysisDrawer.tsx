"use client";

import { useState, useEffect } from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { Video, ShieldCheck, Eye, Activity, Cpu, Sparkles, X, RefreshCw, Layers } from "lucide-react";

type FootageAnalysisDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FootageAnalysisDrawer({ isOpen, onClose }: FootageAnalysisDrawerProps) {
  const { zones, sensors, dataSources } = useEventAuthoringStore();
  const [selectedSensorId, setSelectedSensorId] = useState<string>(sensors[0]?.id || "cctv-01");
  const [frameCount, setFrameCount] = useState(14820);
  const [detectedCount, setDetectedCount] = useState(6420);

  const activeSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];
  const activeZone = zones.find((z) => z.id === activeSensor?.zoneId) || zones[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount((prev) => prev + 1);
      setDetectedCount((prev) => Math.max(100, prev + Math.floor(Math.random() * 15 - 7)));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[9990] w-[460px] border-l border-border bg-background/95 backdrop-blur-md shadow-2xl p-5 flex flex-col font-mono text-xs overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-accent animate-pulse" />
          <div>
            <h2 className="font-extrabold text-foreground text-sm uppercase tracking-wider">
              FOOTAGE ANALYSIS & CV STREAM
            </h2>
            <p className="text-[10px] text-foreground-muted">Live Computer Vision Frame Processor & Headcount Pipeline</p>
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

      {/* CAMERA SELECTOR */}
      <div className="mb-4">
        <label className="text-[10px] font-bold text-foreground-muted block mb-1">SELECT VIDEO SOURCE FEED</label>
        <select
          value={selectedSensorId}
          onChange={(e) => setSelectedSensorId(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-muted/80 px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-accent"
        >
          {sensors.map((s) => (
            <option key={s.id} value={s.id}>
              📹 {s.name} — Zone: {s.zoneId.toUpperCase()} ({s.streamStatus.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* VIDEO SIMULATOR CANVAS CONTAINER */}
      <div className="relative rounded-2xl border border-border bg-slate-950 overflow-hidden aspect-video shadow-lg mb-4">
        {/* Animated CCTV Overlay Simulation */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10 pointer-events-none" />

        {/* Simulated Crowd Video Visual */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="relative w-full h-full p-4 flex flex-col justify-between">
            {/* Detection Bounding Boxes Overlay */}
            <div className="absolute top-8 left-12 w-16 h-20 border-2 border-emerald-400/80 rounded bg-emerald-500/10 flex items-start p-0.5">
              <span className="text-[8px] font-extrabold bg-emerald-500 text-black px-1 rounded">person 0.94</span>
            </div>

            <div className="absolute top-14 left-32 w-20 h-24 border-2 border-emerald-400/80 rounded bg-emerald-500/10 flex items-start p-0.5">
              <span className="text-[8px] font-extrabold bg-emerald-500 text-black px-1 rounded">group 0.91</span>
            </div>

            <div className="absolute bottom-12 right-16 w-24 h-28 border-2 border-amber-400/80 rounded bg-amber-500/10 flex items-start p-0.5">
              <span className="text-[8px] font-extrabold bg-amber-500 text-black px-1 rounded">queue 0.88</span>
            </div>

            {/* Top Bar Video Meta */}
            <div className="relative z-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-[10px] font-black text-red-400 uppercase tracking-widest">
                  REC • {activeSensor?.streamStatus.toUpperCase() || "LIVE"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                FRAME #{frameCount} • 30 FPS
              </span>
            </div>

            {/* Bottom Bar Live Telemetry Badge */}
            <div className="relative z-20 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">YOLO v8 Headcount</div>
                <div className="text-sm font-extrabold text-cyan-400">{detectedCount.toLocaleString()} visitors</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Detection Confidence</div>
                <div className="text-xs font-bold text-emerald-400">94.2% Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STREAM & PIPELINE DIAGNOSTICS */}
      <div className="space-y-3 mb-4">
        <div className="rounded-xl border border-border bg-surface-muted/50 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
            <span className="flex items-center gap-1.5 text-accent">
              <Cpu className="h-3.5 w-3.5" /> Pipeline Model: YOLOv8 + ByteTrack
            </span>
            <span className="text-emerald-400 font-mono">LATENCY: 140ms</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[10px]">
            <div>
              <span className="text-foreground-muted block">Observed Zone</span>
              <span className="font-bold text-foreground uppercase">{activeZone?.code} — {activeZone?.name}</span>
            </div>
            <div>
              <span className="text-foreground-muted block">Stream Source</span>
              <span className="font-bold text-cyan-300 font-mono truncate block">
                {activeSensor?.streamStatus === "simulated" ? "RTSP / Sim Channel A" : "RTSP / Live HD Feed"}
              </span>
            </div>
          </div>
        </div>

        {/* METRICS BREAKDOWN */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-surface p-3 space-y-1">
            <div className="text-[10px] font-bold text-foreground-muted flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" /> Ingress Flow Vector
            </div>
            <div className="text-sm font-extrabold text-foreground">
              +{activeZone?.ingressRatePerMin || 320} <span className="text-[10px] text-foreground-muted">p/min</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-bold">↑ 8% from 5m baseline</div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 space-y-1">
            <div className="text-[10px] font-bold text-foreground-muted flex items-center gap-1">
              <Eye className="h-3 w-3 text-purple-400" /> Zone Density Grade
            </div>
            <div className="text-sm font-extrabold text-amber-400 uppercase">
              {activeZone?.riskLevel === "critical" ? "CRITICAL (87%)" : "HIGH (76%)"}
            </div>
            <div className="text-[9px] text-amber-400 font-bold">Capacity Breach: ~9 mins</div>
          </div>
        </div>
      </div>

      {/* FOOTAGE SOURCE PROVENANCE */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px]">
          <ShieldCheck className="h-4 w-4" /> AUTHORIZED EVENT FEEDS & MUNICIPAL DATA
        </div>
        <p className="text-[10px] text-foreground-muted leading-relaxed">
          Feeds are encrypted and authenticated via Pravaah Spatial Ingestion Router. Sensor observations feed directly into H3 spatial grid density estimation.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-auto flex gap-2">
        <button
          type="button"
          onClick={() => {
            alert(`Freshness re-synchronized for ${activeSensor?.name}. Latest frame frame_id=${frameCount}`);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-muted py-2 font-bold text-foreground hover:bg-surface-muted/80"
        >
          <RefreshCw className="h-3.5 w-3.5 text-accent" /> [ SYNC FRAME ]
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2 font-bold text-white hover:bg-accent/90"
        >
          <Sparkles className="h-3.5 w-3.5" /> [ DONE ]
        </button>
      </div>
    </div>
  );
}
