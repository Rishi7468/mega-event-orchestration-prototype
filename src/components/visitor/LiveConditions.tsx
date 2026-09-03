import { Bus, DoorOpen, Users } from "lucide-react";
import { Card } from "@/components/shared";
import { crowdLabel } from "@/lib/conditions";
import type { VenueGate, ZoneSnapshot } from "@/types";

type LiveConditionsProps = {
  venueSnapshot?: ZoneSnapshot;
  routeName: string;
  routeReliabilityPercent: number;
  routeLoadPercent: number;
  gate: VenueGate;
};

/**
 * Three plain-language readings, not a chart wall — the visitor gets a
 * decision-ready summary (docs/09_MOBILE_UX_PRINCIPLES.md #6).
 */
export function LiveConditions({
  venueSnapshot,
  routeName,
  routeReliabilityPercent,
  routeLoadPercent,
  gate,
}: LiveConditionsProps) {
  const crowd = venueSnapshot ? crowdLabel(venueSnapshot.crowdPressure) : "Moderate";
  // A route can be punctual and still be packed, so say which it is.
  const transportValue =
    routeLoadPercent >= 78 ? "Crowded" : routeReliabilityPercent >= 90 ? "On time" : "Delays";

  const items = [
    {
      icon: Users,
      label: "Crowd ahead",
      value: crowd,
      detail: "Near the venue",
    },
    {
      icon: Bus,
      label: "Transport",
      value: transportValue,
      detail: `${routeName.split("—")[0].trim()} · ${routeLoadPercent}% full`,
    },
    {
      icon: DoorOpen,
      label: gate.name,
      value: `${gate.estimatedWaitMinutes} min`,
      detail: gate.status === "busy" ? "Queue building" : "Normal entry",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map(({ icon: Icon, label, value, detail }) => (
        <Card key={label} className="p-3">
          <Icon className="h-4 w-4 text-foreground-muted" />
          <p className="mt-2 truncate text-[11px] text-foreground-muted">{label}</p>
          <p className="truncate text-sm font-semibold text-foreground">{value}</p>
          <p className="mt-0.5 truncate text-[11px] text-foreground-muted">{detail}</p>
        </Card>
      ))}
    </div>
  );
}
