"use client";

import { useEffect, useRef, useState } from "react";
import { LocalStateTransportAdapter, NetworkStateTransportAdapter, type StateTransportAdapter } from "@/lib/adapters/stateTransportAdapter";
import { useSimulationStore, type SimulationState } from "@/store/simulationStore";

type PatchWithMeta = Partial<SimulationState> & {
  _revision?: number;
  _timestamp?: number;
};

export function TransportSyncBridge() {
  const [mode, setMode] = useState<"network" | "local">("network");
  const [connected, setConnected] = useState<boolean>(true);
  const isRemoteUpdatingRef = useRef<boolean>(false);
  const lastAppliedRevisionRef = useRef<number>(0);

  useEffect(() => {
    const adapter: StateTransportAdapter =
      mode === "network"
        ? new NetworkStateTransportAdapter("/api/simulation")
        : new LocalStateTransportAdapter();

    // 1. Subscribe to incoming remote state patches
    const unsubscribeTransport = adapter.subscribe((remotePatch: PatchWithMeta) => {
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
      setConnected(true);

      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 50);
    });

    // 2. Broadcast local store mutations to network transport
    const unsubscribeStore = useSimulationStore.subscribe((state, prevState) => {
      if (isRemoteUpdatingRef.current) return;

      // Only broadcast when key operational fields mutate
      if (
        state.phase !== prevState.phase ||
        state.activeEventConfigId !== prevState.activeEventConfigId ||
        state.zoneSnapshots !== prevState.zoneSnapshots ||
        state.fieldTasks !== prevState.fieldTasks ||
        state.incidents !== prevState.incidents ||
        state.venueGates !== prevState.venueGates ||
        state.routes !== prevState.routes
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
        });
      }
    });

    return () => {
      unsubscribeTransport();
      unsubscribeStore();
    };
  }, [mode]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs text-slate-300 shadow-sm" title="Realtime state transport bridge across browser tabs and server endpoints.">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? "bg-emerald-400" : "bg-amber-400"}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
      </span>
      <span className="font-semibold text-slate-100">
        {mode === "network" ? "Live Sync Active (SSE Stream)" : "Local Tab Sync (Broadcast)"}
      </span>
      <button
        onClick={() => setMode(mode === "network" ? "local" : "network")}
        className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors border border-indigo-500/30"
        title={mode === "network" ? "Switch to Local Tab-to-Tab Broadcast Sync" : "Switch to Server-Sent Events (SSE) Stream Sync"}
      >
        {mode === "network" ? "Switch to Local Sync" : "Switch to SSE Stream"}
      </button>
    </div>
  );
}
