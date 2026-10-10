"use client";

import { useState } from "react";
import { Megaphone, Tv, ShieldAlert, Radio, CheckCircle, Info } from "lucide-react";

type ChannelOption = {
  id: "vms" | "pa" | "police";
  name: string;
  icon: typeof Tv;
  audience: string;
  controlledBy: string;
  coverageLimit: string;
  operationalDependencies: string;
  status: "READY" | "RECOMMENDED" | "STANDBY";
  sampleMessage: string;
  isPrimary: boolean;
  fallbackChannel: string;
};

const CHANNELS: ChannelOption[] = [
  {
    id: "vms",
    name: "Variable Message Signs (VMS & LED Screens)",
    icon: Tv,
    audience: "Approaching pedestrians and queued crowds along MG Road & Cubbon Road corridors",
    controlledBy: "KSCA Stadium Operations & Traffic Command Desk",
    coverageLimit: "Line-of-sight only; ineffective once crowd density obscures sign visibility",
    operationalDependencies: "Power grid, fiber link to stadium AV control room, KSCA sign operator clearance",
    status: "RECOMMENDED",
    sampleMessage: "CRITICAL ALERT (15:15 IST): Gate 1 Turnstiles at capacity (5,200/min > 4,200/min threshold). Divert immediately to Anil Kumble Circle / Gate 2 for safe entry.",
    isPrimary: true,
    fallbackChannel: "Public Address (PA) Megaphone Squads",
  },
  {
    id: "pa",
    name: "Public Address System & Handheld Megaphones",
    icon: Megaphone,
    audience: "Perimeter crowd within 50-meter acoustic radius of stadium boundary gates",
    controlledBy: "Stadium Safety Officer & Ground Announcers",
    coverageLimit: "High ambient stadium noise (chants/horns) can reduce acoustic intelligibility below 40%",
    operationalDependencies: "Acoustic amplification system, designated Kannada/English announcer, battery backup",
    status: "STANDBY",
    sampleMessage: "ATTENTION ALL SUPPORTERS: Turnstiles 1 & 2 are closed for safety. Move laterally toward Gate 2 and Anil Kumble Circle.",
    isPrimary: false,
    fallbackChannel: "Authorized Police Wireless Advisory",
  },
  {
    id: "police",
    name: "Prayagraj Police & Mela Traffic Advisory (Cell Broadcast)",
    icon: ShieldAlert,
    audience: "Prayagraj Kumbh Mela district pilgrims & arriving vehicular transit",
    controlledBy: "Senior Superintendent of Police (Mela) & State Emergency Operations Centre",
    coverageLimit: "Requires state emergency operations center clearance; 5–12 minute broadcast propagation latency",
    operationalDependencies: "NDMA / State Disaster Management Cell integration, TRAI telecom carrier broadcast protocol",
    status: "READY",
    sampleMessage: "MELA TRAFFIC ALERT: Sangam Ghat perimeter high pilgrim density. Sector 2 corridor cordoned. Divert transit to Triveni Marg West exit.",
    isPrimary: false,
    fallbackChannel: "Variable Message Signs (VMS)",
  },
];

export function NonAppBroadcastPanel() {
  const [selectedChannelId, setSelectedChannelId] = useState<"vms" | "pa" | "police">("vms");
  const [isSimulatedBroadcastSent, setIsSimulatedBroadcastSent] = useState<boolean>(false);

  const selectedChannel = CHANNELS.find((c) => c.id === selectedChannelId) ?? CHANNELS[0];

  const handleSimulateBroadcast = () => {
    setIsSimulatedBroadcastSent(true);
    setTimeout(() => {
      setIsSimulatedBroadcastSent(false);
    }, 4000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-accent-glow animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Non-App Emergency Communication (Multi-Channel Dispatch)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
          [RECOMMENDATION ONLY — ZERO EXTERNAL OUTREACH]
        </span>
      </div>

      <div className="rounded-lg bg-surface-muted/40 p-2.5 border border-border/60 text-[11px] text-foreground-muted flex items-start gap-2">
        <Info className="h-4 w-4 text-accent-glow shrink-0 mt-0.5" />
        <span>
          <strong className="text-foreground">Mass Gathering Communication Reality:</strong> A substantial portion of crowd attendees do not actively use mobile companion applications during spontaneous un-ticketed gatherings. Real-time diversions must be broadcast across physical venue signs, audio systems, and municipal police channels.
        </span>
      </div>

      {/* Channel Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon;
          const isSelected = ch.id === selectedChannelId;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setSelectedChannelId(ch.id)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? "border-accent-glow bg-accent-glow/10 shadow-sm"
                  : "border-border bg-surface-card hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`h-4 w-4 ${isSelected ? "text-accent-glow" : "text-foreground-muted"}`} />
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  ch.isPrimary ? "bg-emerald-500/20 text-emerald-400" : "bg-surface-muted text-foreground-muted"
                }`}>
                  {ch.isPrimary ? "PRIMARY" : "STANDBY"}
                </span>
              </div>
              <span className="text-xs font-bold text-foreground mt-2 line-clamp-1">{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Channel Detailed Specification Card */}
      <div className="rounded-xl border border-border/70 bg-surface-card p-3.5 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground text-xs">{selectedChannel.name}</span>
          <span className="text-[10px] text-foreground-muted">Fallback: <strong className="text-accent-glow">{selectedChannel.fallbackChannel}</strong></span>
        </div>

        <div className="space-y-1.5 text-[11px] text-foreground-muted">
          <div><strong className="text-foreground">Channel Controller / Operator:</strong> <span className="text-foreground font-medium">{selectedChannel.controlledBy}</span></div>
          <div><strong className="text-foreground">Target Audience:</strong> {selectedChannel.audience}</div>
          <div><strong className="text-foreground">Coverage Limitations:</strong> {selectedChannel.coverageLimit}</div>
          <div><strong className="text-foreground">Operational Dependencies:</strong> {selectedChannel.operationalDependencies}</div>
        </div>

        {/* Emergency Message Template with Draft vs Delivered status */}
        <div className="rounded-lg bg-background p-3 border border-border space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Emergency Broadcast Script
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isSimulatedBroadcastSent
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-surface-muted text-amber-400 border border-amber-500/30"
            }`}>
              {isSimulatedBroadcastSent ? "DISPATCHED TO VENUE AV DESK (SIMULATED)" : "DRAFT PROPOSAL — NOT DELIVERED"}
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-foreground leading-relaxed">
            &ldquo;{selectedChannel.sampleMessage}&rdquo;
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-foreground-muted italic">
            *Simulates operator transmission to venue control desk without contacting real public.
          </span>
          <button
            type="button"
            onClick={handleSimulateBroadcast}
            disabled={isSimulatedBroadcastSent}
            className="flex items-center gap-1.5 rounded-lg bg-accent-glow hover:bg-accent-glow/90 text-background px-3.5 py-1.5 text-xs font-bold transition-all shadow disabled:opacity-50"
          >
            {isSimulatedBroadcastSent ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-background" /> Transmitted to AV Desk
              </>
            ) : (
              <>
                <Megaphone className="h-3.5 w-3.5 fill-current" /> Dispatch Recommendation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
