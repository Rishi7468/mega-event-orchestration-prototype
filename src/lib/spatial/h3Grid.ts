import * as h3 from "h3-js";
import type { LatLng } from "@/data/geography";
import type { PlacedAsset } from "@/store/eventAuthoringStore";

export type H3CellStats = {
  h3Index: string;
  boundary: LatLng[]; // Polygon vertice coordinates
  center: LatLng;
  expectedPopulation: number;
  simulatedPopulation: number;
  pressurePercent: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  cctvCount: number;
  medicalCount: number;
  fieldTeamCount: number;
  volunteerCount: number;
  medicalCoveragePercent: number; // 0-100
  fieldCoveragePercent: number;
  visitorReportCount: number;
  primaryZoneId: string;
};

// Default H3 resolution for event sector granularity (Resolution 8 ~ 0.7 km² / Resolution 9 ~ 0.1 km²)
const DEFAULT_H3_RESOLUTION = 8;

/**
 * Converts lat/lng coordinate into H3 Cell Index string
 */
export function getH3CellIndex(lat: number, lng: number, resolution = DEFAULT_H3_RESOLUTION): string {
  try {
    return h3.latLngToCell(lat, lng, resolution);
  } catch {
    // Fallback pseudo index if coordinate out of bounds
    return `h3-fallback-${Math.floor(lat * 100)}-${Math.floor(lng * 100)}`;
  }
}

/**
 * Returns polygon boundary array [lat, lng][] for an H3 cell index
 */
export function getH3CellBoundary(h3Index: string): LatLng[] {
  try {
    const boundary = h3.cellToBoundary(h3Index);
    // h3-js returns [lat, lng][]
    return boundary.map(([lat, lng]) => [lat, lng]);
  } catch {
    return [];
  }
}

/**
 * Returns center coordinate [lat, lng] for an H3 cell index
 */
export function getH3CellCenter(h3Index: string): LatLng {
  try {
    const [lat, lng] = h3.cellToLatLng(h3Index);
    return [lat, lng];
  } catch {
    return [25.4255, 81.8820];
  }
}

/**
 * Generates H3 cell stats array for a set of region lat/lng bounding coordinates
 */
export function generateH3GridForRegion(
  regionPolygon: LatLng[],
  zones: { id: string; name: string; capacity: number }[],
  placedAssets: PlacedAsset[] = [],
  visitorReports: { h3Index: string; count: number }[] = [],
  resolution = DEFAULT_H3_RESOLUTION,
): H3CellStats[] {
  if (!regionPolygon || regionPolygon.length < 3) {
    return [];
  }

  try {
    // Convert region polygon to h3-js format: [[lat, lng], [lat, lng]...]
    const h3Polygon = regionPolygon.map(([lat, lng]) => [lat, lng]);
    const hexIndexes = h3.polygonToCells(h3Polygon, resolution);

    // Limit cell count for rendering performance (max 40 cells)
    const activeHexes = hexIndexes.slice(0, 40);

    return activeHexes.map((hex, idx) => {
      const boundary = getH3CellBoundary(hex);
      const center = getH3CellCenter(hex);

      // Find nearby placed assets for this cell
      const cellAssets = placedAssets.filter((a) => a.h3Cell === hex || getH3CellIndex(a.lat, a.lng, resolution) === hex);
      const cctvCount = cellAssets.filter((a) => a.type === "cctv").length;
      const medicalCount = cellAssets.filter((a) => a.type === "medical").length;
      const fieldTeamCount = cellAssets.filter((a) => a.type === "field_team").length;
      const volunteerCount = cellAssets.filter((a) => a.type === "volunteer").length;

      // Find visitor reports for this cell
      const reportMatch = visitorReports.find((r) => r.h3Index === hex);
      const visitorReportCount = reportMatch ? reportMatch.count : Math.floor((idx * 3) % 7);

      // Pseudo population simulation for cell
      const baseCap = 2500 + (idx % 4) * 800;
      const simulatedPop = Math.round(baseCap * (0.45 + ((idx * 17) % 50) / 100));
      const pressure = Math.min(98, Math.round((simulatedPop / baseCap) * 100));

      const medCoverage = Math.min(100, medicalCount > 0 ? 90 : pressure > 75 ? 40 : 65);
      const fieldCoverage = Math.min(100, fieldTeamCount > 0 ? 85 : 55);

      let risk: H3CellStats["riskLevel"] = "low";
      if (pressure > 85 || (pressure > 75 && medCoverage < 50)) {
        risk = "critical";
      } else if (pressure > 70 || visitorReportCount > 5) {
        risk = "high";
      } else if (pressure > 55) {
        risk = "medium";
      }

      const assignedZone = zones.length > 0 ? zones[idx % zones.length].id : "central";

      return {
        h3Index: hex,
        boundary,
        center,
        expectedPopulation: baseCap,
        simulatedPopulation: simulatedPop,
        pressurePercent: pressure,
        riskLevel: risk,
        cctvCount,
        medicalCount,
        fieldTeamCount,
        volunteerCount,
        medicalCoveragePercent: medCoverage,
        fieldCoveragePercent: fieldCoverage,
        visitorReportCount,
        primaryZoneId: assignedZone,
      };
    });
  } catch {
    console.warn("H3 Grid Generation Warning");
    return [];
  }
}
