import type { ReactNode } from "react";
import { DeviceFrame, QuickTour, VisitorShell } from "@/components/visitor";

export default function VisitorLayout({ children }: { children: ReactNode }) {
  return (
    <DeviceFrame>
      <VisitorShell>{children}</VisitorShell>
      {/* Overlays the device screen, not the desktop page. */}
      <QuickTour />
    </DeviceFrame>
  );
}
