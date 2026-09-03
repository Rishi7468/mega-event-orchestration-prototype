"use client";

import { Card, Stepper } from "@/components/shared";
import { useVisitorStore } from "@/store/visitorStore";

const ARRIVAL_OPTIONS = ["08:00 AM", "10:00 AM", "02:00 PM"];

/**
 * Editing any of these re-scores every zone immediately — the recommendation
 * visibly responds to the visitor's own priorities rather than being fixed.
 */
export function TripPreferences() {
  const profile = useVisitorStore((state) => state.profile);
  const updateProfile = useVisitorStore((state) => state.updateProfile);

  return (
    <Card className="divide-y divide-border">
      {/* Party size lives on the destination-intent screen — it's part of
          "who is attending", not of choosing a stay. */}
      <div className="space-y-3 p-4">
        <Stepper
          label="Nights"
          value={profile.stayNights}
          min={1}
          max={7}
          onChange={(stayNights) => updateProfile({ stayNights })}
        />
        <Stepper
          label="Budget / night"
          value={profile.budgetPerNight}
          min={1000}
          max={6000}
          step={500}
          format={(value) => `₹${value.toLocaleString("en-IN")}`}
          onChange={(budgetPerNight) => updateProfile({ budgetPerNight })}
        />
      </div>

      <div className="p-4">
        <p className="mb-2 text-sm text-foreground-muted">Preferred arrival</p>
        <div className="flex gap-2">
          {ARRIVAL_OPTIONS.map((option) => {
            const active = profile.preferredArrival === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateProfile({ preferredArrival: option })}
                aria-pressed={active}
                className={`h-11 flex-1 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-border text-foreground-muted"
                }`}
              >
                {option.replace(":00", "")}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
