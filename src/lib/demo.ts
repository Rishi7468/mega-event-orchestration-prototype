import { broadcastDemoReset } from "./demoReset";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * The one way to start the demo over.
 *
 * Every Reset control on every surface calls this, so a reset always means
 * the same thing: destination conditions back to normal *and* every tab's
 * visitor plan cleared. Previously each surface reset a different subset,
 * which meant "Reset" in the organiser tab left the visitor mid-journey.
 */
export function resetDemo(): void {
  useSimulationStore.getState().reset();
  broadcastDemoReset();
}

/** Runs the full crowd-surge scenario: normal → spike → prediction → recommendation. */
export function runDemoScenario(): void {
  useSimulationStore.getState().runDemandSpikeScenario();
}
