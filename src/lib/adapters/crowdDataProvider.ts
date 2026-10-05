import type { ZoneSnapshot } from "@/types";

export type RawVisionTelemetry = {
  cameraId: string;
  zoneId: string;
  personCount: number;
  densityPerSqMeter: number;
  timestamp: string;
  model: "yolov8n" | "yolo11" | "bytetrack";
};

export interface CrowdDataProvider {
  name: string;
  fetchZoneSnapshots(currentSnapshots: ZoneSnapshot[]): Promise<ZoneSnapshot[]>;
}

export class SimulatedCrowdProvider implements CrowdDataProvider {
  name = "Simulation Engine Telemetry";

  async fetchZoneSnapshots(currentSnapshots: ZoneSnapshot[]): Promise<ZoneSnapshot[]> {
    return Promise.resolve(currentSnapshots);
  }
}

export class VisionCrowdProvider implements CrowdDataProvider {
  name = "YOLOv8 + ByteTrack Computer Vision Adapter";

  private telemetryBuffer: Map<string, RawVisionTelemetry> = new Map();

  public ingestVisionTelemetry(telemetry: RawVisionTelemetry) {
    this.telemetryBuffer.set(telemetry.zoneId, telemetry);
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
}
