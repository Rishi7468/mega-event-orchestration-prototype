"use client";

import { RefreshCw, Radio, Zap } from "lucide-react";

export function VisualStateSync() {
  return (
    <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">VISUAL-05</span>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Dual-Surface State Synchronization Lifecycle</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
          <Radio className="h-4 w-4 animate-pulse" />
          BroadcastChannel(&quot;pravaah_sim_sync&quot;) Active
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* Same-Tab State */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              1. Same-Tab Reactive Sync
            </div>
            <p className="text-xs text-[#a1a1aa] mb-3">
              Zustand <code className="text-[#60a5fa]">useSimulationStore</code> reactive selectors trigger instant re-renders in components within the same browser tab.
            </p>
          </div>
          <div className="rounded-lg bg-[#14171b] border border-[#262b31] p-3 text-[11px] font-mono text-[#a1a1aa]">
            Store Update → UI Re-render (&lt; 1ms)
          </div>
        </div>

        {/* Cross-Tab State */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              2. Cross-Tab Browser Sync
            </div>
            <p className="text-xs text-[#a1a1aa] mb-3">
              <code className="text-[#60a5fa]">TransportSyncBridge.tsx</code> broadcasts state snapshots across open tabs via browser BroadcastChannel API.
            </p>
          </div>
          <div className="rounded-lg bg-[#14171b] border border-[#262b31] p-3 text-[11px] font-mono text-[#a1a1aa]">
            BroadcastChannel(&quot;pravaah_sim_sync&quot;)
          </div>
        </div>

        {/* Server-Backed SSE */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-2">
              <Radio className="h-4 w-4 text-purple-400" />
              3. Server-Backed SSE Stream
            </div>
            <p className="text-xs text-[#a1a1aa] mb-3">
              Server-Sent Events endpoint <code className="text-[#60a5fa]">/api/simulation/stream</code> streams simulation events to remote web clients.
            </p>
          </div>
          <div className="rounded-lg bg-[#14171b] border border-[#262b31] p-3 text-[11px] font-mono text-[#a1a1aa]">
            Server-Sent Events (SSE) Protocol
          </div>
        </div>
      </div>
    </div>
  );
}
