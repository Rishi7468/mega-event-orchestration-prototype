"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Radio, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/shared";
import {
  getTourSeenServerSnapshot,
  getTourSeenSnapshot,
  markTourSeen,
  subscribeTourSeen,
} from "@/lib/tourStorage";

type Step = { icon: LucideIcon; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: CalendarCheck,
    title: "Plan smarter",
    body: "Tell us which event you're attending and where you're travelling from.",
  },
  {
    icon: Route,
    title: "Travel smarter",
    body: "We weigh demand, accommodation, transport and crowd conditions to find your best plan.",
  },
  {
    icon: Radio,
    title: "Adapt in real time",
    body: "If conditions change on the way, we recommend a better option before it costs you time.",
  },
];

/**
 * Short, skippable, first-run only. Mounted client-side after hydration
 * (never during SSR) so reading localStorage can't cause a hydration
 * mismatch, and returning visitors never see a flash of it.
 */
export function QuickTour() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const seen = useSyncExternalStore(
    subscribeTourSeen,
    getTourSeenSnapshot,
    getTourSeenServerSnapshot,
  );

  if (seen) return null;

  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === STEPS.length - 1;

  // Marking it seen notifies the store, which re-renders this away.
  const dismiss = () => markTourSeen();

  const finish = () => {
    dismiss();
    router.push("/visitor/destination");
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="animate-fade-up rounded-3xl bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-muted">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="-mr-1 -mt-1 h-9 px-2 text-sm text-foreground-muted"
          >
            Skip
          </button>
        </div>

        {/* key remounts the text so each step animates in */}
        <div key={step.title} className="animate-fade-up mt-4">
          <h2 className="text-xl font-semibold leading-tight text-foreground">{step.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">{step.body}</p>
        </div>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === stepIndex ? "w-6 bg-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => (isLast ? finish() : setStepIndex((index) => index + 1))}
        >
          {isLast ? "Plan my visit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
