"use client";

import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { MessageSquare, Star } from "lucide-react";

export function VisitorSignalsIntegrationCard() {
  const { zones } = useEventAuthoringStore();

  // Mock aggregated visitor signal feedback for zones
  const visitorSignalsSummary = zones.map((z, idx) => ({
    zoneCode: z.code,
    zoneName: z.name,
    totalSignals: 12 + idx * 8,
    crowding: 6 + idx * 3,
    queue: 3 + idx,
    safety: 1 + idx,
    medical: 1,
    rating: (4.5 - idx * 0.3).toFixed(1),
    navSuccessPercent: Math.max(78, 96 - idx * 6),
  }));

  const totalAppSignals = visitorSignalsSummary.reduce((acc, curr) => acc + curr.totalSignals, 0);
  const avgRating = (
    visitorSignalsSummary.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) /
    (visitorSignalsSummary.length || 1)
  ).toFixed(1);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-accent" /> VISITOR EXPERIENCE & SIGNALS INTEGRATION
        </h3>
        <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30">
          LIVE VISITOR FEED
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2">
          <span className="text-[10px] text-foreground-muted block uppercase">Satisfaction</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
            <Star className="h-3 w-3 fill-emerald-400" /> {avgRating} / 5.0
          </span>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2">
          <span className="text-[10px] text-foreground-muted block uppercase">Signals Received</span>
          <span className="text-xs font-bold text-accent">{totalAppSignals} Feedback</span>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/40 p-2">
          <span className="text-[10px] text-foreground-muted block uppercase">Nav Success</span>
          <span className="text-xs font-bold text-foreground">92%</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-foreground-muted uppercase block">
          Spatial Zone Signals Breakdown
        </span>

        {zones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-3 text-center text-foreground-muted text-[11px]">
            Define event sectors to aggregate live visitor signals.
          </div>
        ) : (
          <div className="space-y-1.5 font-mono">
            {visitorSignalsSummary.map((item) => (
              <div
                key={item.zoneCode}
                className="rounded-xl border border-border/70 bg-surface-muted/30 p-2.5 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-extrabold text-accent">{item.zoneCode}</span>
                  <span className="text-foreground-muted ml-1.5 text-[11px]">{item.zoneName}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="rounded bg-amber-500/10 text-amber-400 px-1.5 py-0.5 border border-amber-500/20">
                    Crowd: {item.crowding}
                  </span>
                  <span className="rounded bg-blue-500/10 text-blue-400 px-1.5 py-0.5 border border-blue-500/20">
                    Queue: {item.queue}
                  </span>
                  <span className="rounded bg-red-500/10 text-red-400 px-1.5 py-0.5 border border-red-500/20">
                    Safety: {item.safety}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
