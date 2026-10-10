"use client";

import { useEffect, useRef, useState } from "react";
import { LocalStateTransportAdapter, NetworkStateTransportAdapter, type StateTransportAdapter } from "@/lib/adapters/stateTransportAdapter";
import { useSimulationStore, type SimulationState } from "@/store/simulationStore";
import { subscribeDemoReset } from "@/lib/demoReset";
import { VisitorResetControl } from "@/components/visitor/VisitorResetControl";

type PatchWithMeta = Partial<SimulationState> & {
  _revision?: number;
  _timestamp?: number;
};

export type SyncVariant = "full" | "compact" | "badge" | "visitor" | "headless";

export function TransportSyncBridge({ variant = "full" }: { variant?: SyncVariant }) {
  const [mode, setMode] = useState<"network" | "local">("network");
  const [transportStatus, setTransportStatus] = useState<"connected" | "reconnecting" | "offline_cached">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [offlineElapsedSeconds, setOfflineElapsedSeconds] = useState<number>(0);
  const isRemoteUpdatingRef = useRef<boolean>(false);
  const lastAppliedRevisionRef = useRef<number>(0);

  const status = isSimulatedOffline ? "offline_cached" : transportStatus;

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setOfflineElapsedSeconds(0);
      }
      return next;
    });
  };

  // Timer for tracking data age when simulated offline
  useEffect(() => {
    if (!isSimulatedOffline) return;
    const interval = setInterval(() => {
      setOfflineElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulatedOffline]);

  // Safely restore link and clear simulated offline status on demo reset
  useEffect(() => {
    return subscribeDemoReset(() => {
      setIsSimulatedOffline(false);
      setOfflineElapsedSeconds(0);
      setTransportStatus("connected");
    });
  }, []);

  useEffect(() => {
    // If simulated offline, completely isolate transport from remote updates
    if (isSimulatedOffline) {
      return;
    }

    const adapter: StateTransportAdapter =
      mode === "network"
        ? new NetworkStateTransportAdapter("/api/simulation")
        : new LocalStateTransportAdapter();

    // 1. Subscribe to incoming remote state patches
    const unsubscribeTransport = adapter.subscribe((remotePatch: PatchWithMeta) => {
      if (isSimulatedOffline) return; // Honest isolation: reject all remote patches

      // Monotonic sequence check: ignore stale/out-of-order patches
      if (remotePatch._revision && remotePatch._revision <= lastAppliedRevisionRef.current) {
        return;
      }

      if (remotePatch._revision) {
        lastAppliedRevisionRef.current = remotePatch._revision;
      }

      isRemoteUpdatingRef.current = true;
      const cleanState = { ...remotePatch };
      delete cleanState._revision;
      delete cleanState._timestamp;

      useSimulationStore.setState(cleanState);
      setTransportStatus("connected");
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 50);
    });

    // 2. Broadcast local store mutations to network transport
    const unsubscribeStore = useSimulationStore.subscribe((state, prevState) => {
      if (isRemoteUpdatingRef.current || isSimulatedOffline) return;

      // Only broadcast when key operational fields mutate
      if (
        state.phase !== prevState.phase ||
        state.activeEventConfigId !== prevState.activeEventConfigId ||
        state.zoneSnapshots !== prevState.zoneSnapshots ||
        state.fieldTasks !== prevState.fieldTasks ||
        state.incidents !== prevState.incidents ||
        state.venueGates !== prevState.venueGates ||
        state.routes !== prevState.routes ||
        state.isReplayMode !== prevState.isReplayMode ||
        state.replayCurrentTimestamp !== prevState.replayCurrentTimestamp ||
        state.lastActionDispatchedAt !== prevState.lastActionDispatchedAt ||
        state.liveCrowdStates !== prevState.liveCrowdStates
      ) {
        adapter.broadcast({
          phase: state.phase,
          activeEventConfigId: state.activeEventConfigId,
          zoneSnapshots: state.zoneSnapshots,
          fieldTasks: state.fieldTasks,
          incidents: state.incidents,
          venueGates: state.venueGates,
          routes: state.routes,
          activeInterventions: state.activeInterventions,
          measurements: state.measurements,
          isReplayMode: state.isReplayMode,
          replayScenarioTitle: state.replayScenarioTitle,
          replayCurrentTimestamp: state.replayCurrentTimestamp,
          replayWarningTime: state.replayWarningTime,
          replayPeakTime: state.replayPeakTime,
          lastActionDispatchedAt: state.lastActionDispatchedAt,
          lastActionTitle: state.lastActionTitle,
          lastActionZoneId: state.lastActionZoneId,
          liveCrowdStates: state.liveCrowdStates,
        });
      }
    });

    return () => {
      unsubscribeTransport();
      unsubscribeStore();
    };
  }, [mode, isSimulatedOffline]);

  const isDataStale = isSimulatedOffline && offlineElapsedSeconds >= 5;

  if (variant === "headless") {
    return null;
  }

  if (variant === "visitor") {
    return (
      <div className="space-y-2">
        <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono border shadow-xs backdrop-blur-md transition-all ${
          isSimulatedOffline
            ? isDataStale
              ? "bg-rose-950/60 border-rose-500/50 text-rose-200"
              : "bg-amber-950/60 border-amber-500/50 text-amber-200"
            : "bg-surface/90 border-border text-foreground"
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSimulatedOffline
                    ? isDataStale ? "bg-rose-400" : "bg-amber-400"
                    : status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSimulatedOffline
                    ? isDataStale ? "bg-rose-500" : "bg-amber-500"
                    : status === "connected" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="font-semibold">
              {isSimulatedOffline ? (
                isDataStale ? (
                  <strong className="text-rose-400 font-bold">
                    STALE CACHE ({offlineElapsedSeconds}s &gt; 5s SLA) · Disconnected
                  </strong>
                ) : (
                  <strong className="text-amber-400 font-bold">
                    OFFLINE — CACHED ROUTE ({offlineElapsedSeconds}s)
                  </strong>
                )
              ) : (
                `Synced: ${lastSyncTime}`
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-foreground-muted hidden sm:inline text-[9px]">
              Last Sync: {lastSyncTime}
            </span>
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                isSimulatedOffline
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                  : "bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border-amber-500/40"
              }`}
              title="Test offline behavior: disconnects transport and tests 5-second staleness rule"
            >
              {isSimulatedOffline ? "Restore Link (Online)" : "Simulate Disconnect (Offline)"}
            </button>
            <VisitorResetControl variant="compact" />
          </div>
        </div>

        {/* Offline Warning Banner with Limitation Disclosure */}
        {isSimulatedOffline && (
          <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 transition-all ${
            isDataStale
              ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
              : "bg-amber-950/40 border-amber-500/40 text-amber-200"
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>
                {isDataStale ? "DATA AGE EXCEEDS 5-SECOND SLA LIMIT" : "OFFLINE: PRESERVING LAST KNOWN ROUTE"}
              </span>
              <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-background/60">
                [SIMULATED BACKHAUL LOSS]
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-foreground-muted">
              {isDataStale
                ? "Data freshness cannot be verified. New operator emergency overrides cannot be delivered to this device while offline. Follow physical venue signage and steward directions."
                : "Device is disconnected from venue dispatch. Retaining cached journey route. Overrides will not be received until link is restored."}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs text-slate-300 shadow-sm" title="Realtime state transport bridge across browser tabs and server endpoints.">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isSimulatedOffline ? "bg-rose-400" : status === "connected" ? "bg-emerald-400" : "bg-amber-400"
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isSimulatedOffline ? "bg-rose-500" : status === "connected" ? "bg-emerald-500" : "bg-amber-500"
        }`}></span>
      </span>
      <span className="font-semibold text-slate-100">
        {isSimulatedOffline
          ? `Link Disconnected (${offlineElapsedSeconds}s) · Last Sync: ${lastSyncTime}`
          : status === "connected"
          ? mode === "network"
            ? `Live Sync Active (SSE) · ${lastSyncTime}`
            : `Local Tab Sync · ${lastSyncTime}`
          : `Offline Cache (Last: ${lastSyncTime})`}
      </span>
      <button
        onClick={toggleSimulatedOffline}
        className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold border transition-colors ${
          isSimulatedOffline
            ? "bg-emerald-600 text-white border-emerald-400"
            : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border-rose-500/30"
        }`}
        title="Simulate loss of backhaul connection for testing offline/stale handling"
      >
        {isSimulatedOffline ? "Reconnect Link" : "Simulate Disconnect"}
      </button>
      {!isSimulatedOffline && (
        <button
          onClick={() => setMode(mode === "network" ? "local" : "network")}
          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors border border-indigo-500/30"
          title={mode === "network" ? "Switch to Local Tab-to-Tab Broadcast Sync" : "Switch to Server-Sent Events (SSE) Stream Sync"}
        >
          {mode === "network" ? "Switch to Local" : "Switch to SSE"}
        </button>
      )}
    </div>
  );
}
