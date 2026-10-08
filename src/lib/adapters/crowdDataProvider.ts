import type { ZoneSnapshot, ZoneCrowdState, CrowdFlowGraph, CrowdFlowEdge } from "@/types";
import { computeZoneCrowdState, type RawCrowdObservation } from "@/lib/intelligence/crowdStateEngine";
import { createInitialCrowdFlowGraph, updateCrowdFlowGraphWithTelemetry } from "@/lib/intelligence/flowGraphEngine";

export type RawVisionTelemetry = {
  cameraId: string;
  zoneId: string;
  personCount: number;
  densityPerSqMeter: number;
  timestamp: string;
  model: "yolov8n" | "yolo11" | "bytetrack";
  confidencePercent?: number;
  trackIds?: string[];
  source?: "CV" | "SIMULATED";
  flowPatch?: Partial<CrowdFlowEdge>[];
};

export interface CrowdDataProvider {
  name: string;
  providerType: "CV" | "SIMULATED";
  fetchZoneSnapshots(currentSnapshots: ZoneSnapshot[]): Promise<ZoneSnapshot[]>;
  getLiveCrowdState(
    zoneId: string,
    capacity: number,
    previousState?: ZoneCrowdState,
    fallbackPressure?: number
  ): ZoneCrowdState;
  getLiveFlowGraph(currentGraph?: CrowdFlowGraph): CrowdFlowGraph;
}

export class SimulatedCrowdProvider implements CrowdDataProvider {
  name = "Simulation Engine Telemetry";
  providerType: "CV" | "SIMULATED" = "SIMULATED";

  async fetchZoneSnapshots(currentSnapshots: ZoneSnapshot[]): Promise<ZoneSnapshot[]> {
    return Promise.resolve(currentSnapshots);
  }

  getLiveCrowdState(
    zoneId: string,
    capacity: number,
    previousState?: ZoneCrowdState,
    fallbackPressure: number = 40
  ): ZoneCrowdState {
    return computeZoneCrowdState(
      { zoneId, name: zoneId, capacity },
      undefined,
      previousState,
      fallbackPressure
    );
  }

  getLiveFlowGraph(currentGraph?: CrowdFlowGraph): CrowdFlowGraph {
    return currentGraph ?? createInitialCrowdFlowGraph();
  }
}

export class VisionCrowdProvider implements CrowdDataProvider {
  name = "YOLOv8 + ByteTrack Computer Vision Adapter";
  providerType: "CV" | "SIMULATED" = "CV";

  private telemetryBuffer: Map<string, RawVisionTelemetry> = new Map();

  public ingestVisionTelemetry(telemetry: RawVisionTelemetry) {
    this.telemetryBuffer.set(telemetry.zoneId, {
      ...telemetry,
      source: telemetry.source ?? "CV",
    });
  }

  public getRawTelemetry(zoneId: string): RawVisionTelemetry | undefined {
    return this.telemetryBuffer.get(zoneId);
  }

  async fetchZoneSnapshots(currentSnapshots: ZoneSnapshot[]): Promise<ZoneSnapshot[]> {
    return currentSnapshots.map((snap) => {
      const vision = this.telemetryBuffer.get(snap.zoneId);
      if (!vision) return snap;

      // Map vision person density (0-4 persons/m²) to pressure percentage (0-100%)
      const calculatedCrowdPressure = Math.min(100, Math.round((vision.densityPerSqMeter / 3.5) * 100));

      return {
        ...snap,
        crowdPressure: calculatedCrowdPressure,
      };
    });
  }

  getLiveCrowdState(
    zoneId: string,
    capacity: number,
    previousState?: ZoneCrowdState,
    fallbackPressure: number = 40
  ): ZoneCrowdState {
    const vision = this.telemetryBuffer.get(zoneId);
    let obs: RawCrowdObservation | undefined = undefined;

    if (vision) {
      obs = {
        zoneId: vision.zoneId,
        cameraId: vision.cameraId,
        personCount: vision.personCount,
        densityPerSqMeter: vision.densityPerSqMeter,
        confidencePercent: vision.confidencePercent ?? 94,
        source: vision.source ?? "CV",
        trackIds: vision.trackIds,
        timestamp: Date.now(),
      };
    }

    return computeZoneCrowdState(
      { zoneId, name: zoneId, capacity },
      obs,
      previousState,
      fallbackPressure
    );
  }

  getLiveFlowGraph(currentGraph?: CrowdFlowGraph): CrowdFlowGraph {
    const baseGraph = currentGraph ?? createInitialCrowdFlowGraph();
    let patches: Partial<CrowdFlowEdge>[] = [];

    this.telemetryBuffer.forEach((telemetry) => {
      if (telemetry.flowPatch) {
        patches = [...patches, ...telemetry.flowPatch];
      }
    });

    if (patches.length === 0) return baseGraph;
    return updateCrowdFlowGraphWithTelemetry(baseGraph, patches);
  }
}
