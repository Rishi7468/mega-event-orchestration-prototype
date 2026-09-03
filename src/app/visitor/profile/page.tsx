"use client";

import { useRouter } from "next/navigation";
import { PlayCircle, RotateCcw, User } from "lucide-react";
import { Button, Card, SectionHeading } from "@/components/shared";
import { OriginSelector, VisitorPageHeader } from "@/components/visitor";
import { resetDemo } from "@/lib/demo";
import { clearTourSeen } from "@/lib/tourStorage";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorStore } from "@/store/visitorStore";

export default function ProfilePage() {
  const router = useRouter();
  const { destination, timing } = useTripIntent();
  const profile = useVisitorStore((state) => state.profile);
  const originId = useVisitorStore((state) => state.originId);
  const setOrigin = useVisitorStore((state) => state.setOrigin);

  // Same single reset every other surface uses — clears conditions and the
  // visitor plan, in this tab and any other open one.
  const handleReset = () => {
    resetDemo();
    router.push("/visitor");
  };

  // Clearing the flag notifies the tour's store, so it reappears immediately
  // — no reload needed.
  const replayTour = () => {
    clearTourSeen();
    router.push("/visitor");
  };

  const details = [
    { label: "Attending", value: destination?.name ?? "Not chosen yet" },
    { label: "Date", value: timing?.selectedDay?.label ?? "Best time" },
    { label: "People", value: `${profile.partySize}` },
    { label: "Nights", value: String(profile.stayNights) },
    { label: "Budget / night", value: `₹${profile.budgetPerNight.toLocaleString("en-IN")}` },
  ];

  return (
    <div>
      <VisitorPageHeader title={profile.name} subtitle="Trip preferences" backHref="/visitor" />

      <div className="space-y-5">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-muted">
            <User className="h-5 w-5 text-foreground-muted" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="truncate text-xs text-foreground-muted">
              {destination ? `Attending ${destination.name}` : "No event selected"}
            </p>
          </div>
        </Card>

        <div>
          <SectionHeading title="Travelling from" />
          <OriginSelector originId={originId} onChange={setOrigin} />
        </div>

        <div>
          <SectionHeading title="Your trip" />
          <Card className="divide-y divide-border">
            {details.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="shrink-0 text-sm text-foreground-muted">{label}</span>
                <span className="truncate text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </Card>
          <p className="mt-2 px-1 text-xs text-foreground-muted">
            Change the event or date from the planning screen — recommendations update as you do.
          </p>
        </div>

        <div className="space-y-2.5">
          <SectionHeading title="Demo" />
          <Button variant="secondary" className="w-full" onClick={replayTour}>
            <PlayCircle className="h-4 w-4" />
            Replay quick tour
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset trip and conditions
          </Button>
        </div>
      </div>
    </div>
  );
}
