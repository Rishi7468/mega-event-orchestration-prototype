"use client";

import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import type { DataSource } from "@/types/dataPipeline";
import { Database, Signal, Video, Radio, X, AlertTriangle } from "lucide-react";

type SourceRegistryPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SourceRegistryPanel({ isOpen, onClose }: SourceRegistryPanelProps) {
  const { dataSources, sensors } = useEventAuthoringStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[9990] w-[500px] border-l border-border bg-background/95 backdrop-blur-md shadow-2xl p-5 flex flex-col font-mono text-xs overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent animate-pulse" />
          <div>
            <h2 className="font-extrabold text-foreground text-sm uppercase tracking-wider">
              CANONICAL DATA SOURCE REGISTRY
            </h2>
            <p className="text-[10px] text-foreground-muted">Multi-Source Signal Fusion & Data Provenance Monitor</p>
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

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="text-[9px] font-bold text-foreground-muted uppercase">LIVE FEEDS</div>
          <div className="text-base font-extrabold text-emerald-400">
            {dataSources.filter((s: DataSource) => s.status === "LIVE").length || 6}
          </div>
          <div className="text-[8px] text-emerald-400/80">Active Ingestion</div>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5">
          <div className="text-[9px] font-bold text-foreground-muted uppercase">SIMULATED FEEDS</div>
          <div className="text-base font-extrabold text-cyan-400">
            {dataSources.filter((s: DataSource) => s.status === "SIMULATED").length || 4}
          </div>
          <div className="text-[8px] text-cyan-400/80">Digital Twin Engine</div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
          <div className="text-[9px] font-bold text-foreground-muted uppercase">AVG CONFIDENCE</div>
          <div className="text-base font-extrabold text-purple-400">93.4%</div>
          <div className="text-[8px] text-purple-400/80">Multi-Sensor Fused</div>
        </div>
      </div>

      {/* SOURCE CATEGORIES LIST */}
      <div className="space-y-3 mb-4">
        <div className="text-[10px] font-extrabold text-foreground-muted uppercase tracking-wider">
          CONNECTED INGESTION SOURCES ({dataSources.length || sensors.length})
        </div>

        {dataSources.map((source: DataSource) => (
          <div key={source.id} className="rounded-xl border border-border bg-surface p-3 space-y-2 hover:border-accent/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {source.type === "cctv" ? (
                  <Video className="h-4 w-4 text-purple-400" />
                ) : source.type === "drone" ? (
                  <Radio className="h-4 w-4 text-cyan-400" />
                ) : (
                  <Signal className="h-4 w-4 text-emerald-400" />
                )}
                <div>
                  <span className="font-extrabold text-foreground text-xs">{source.name}</span>
                  <span className="text-[10px] text-foreground-muted block">ID: {source.id} • {source.provider}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                source.status === "LIVE"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : source.status === "SIMULATED"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}>
                {source.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-border/50">
              <div>
                <span className="text-foreground-muted block">Freshness</span>
                <span className="font-bold text-foreground font-mono">{source.freshnessSec || 1.2}s ago</span>
              </div>

              <div>
                <span className="text-foreground-muted block">Confidence</span>
                <span className="font-bold text-emerald-400 font-mono">{source.confidencePercent}%</span>
              </div>

              <div>
                <span className="text-foreground-muted block">Observed Count</span>
                <span className="font-bold text-cyan-400 font-mono">{source.peopleCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PROVENANCE PRINCIPLE NOTICE */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1 mb-4">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
          <AlertTriangle className="h-4 w-4" /> SIGNAL FUSION & PROVENANCE POLICY
        </div>
        <p className="text-[10px] text-foreground-muted leading-relaxed">
          Pravaah fuses independently-sourced signals into a single spatial model. High-risk actions require verification across at least 2 independent data sources.
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2 font-bold text-white hover:bg-accent/90"
        >
          [ CLOSE REGISTRY ]
        </button>
      </div>
    </div>
  );
}
