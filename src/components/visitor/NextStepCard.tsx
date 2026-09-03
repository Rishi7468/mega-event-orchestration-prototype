"use client";

import { Bed, Bus, DoorOpen, Footprints, Landmark, MapPin, Navigation } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, Card } from "@/components/shared";
import type { JourneyStep } from "@/types";

const stepIcon: Record<JourneyStep["type"], LucideIcon> = {
  stay: Bed,
  walk: Footprints,
  "transit-hub": Landmark,
  shuttle: Bus,
  gate: DoorOpen,
  venue: MapPin,
};

/** The verb the visitor would actually use to confirm this leg is done. */
const advanceLabel: Record<JourneyStep["type"], string> = {
  stay: "I've set off",
  walk: "I've arrived",
  "transit-hub": "I've boarded",
  shuttle: "I've got off",
  gate: "I'm through the gate",
  venue: "Finish",
};

type NextStepCardProps = {
  step: JourneyStep;
  isFinal: boolean;
  onAdvance: () => void;
};

/**
 * Answers the one question the Live Journey screen exists to answer:
 * "what do I need to do right now?" (docs/03_VISITOR_EXPERIENCE.md §8).
 */
export function NextStepCard({ step, isFinal, onAdvance }: NextStepCardProps) {
  const Icon = stepIcon[step.type];

  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
        {isFinal ? "You've arrived" : "Next step"}
      </p>
      <div className="mt-2 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-tight text-foreground">{step.title}</h2>
          {step.subtitle && <p className="mt-0.5 text-sm text-foreground-muted">{step.subtitle}</p>}
          <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
            {step.time}
            {step.durationMinutes > 0 && ` · ${step.durationMinutes} min`}
          </p>
        </div>
      </div>

      {!isFinal && (
        <Button className="mt-4 w-full" onClick={onAdvance}>
          <Navigation className="h-4 w-4" />
          {advanceLabel[step.type]}
        </Button>
      )}
    </Card>
  );
}
