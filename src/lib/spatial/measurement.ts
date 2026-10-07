import type { LatLng } from "@/data/geography";

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total route distance in meters from waypoints
 */
export function calculatePolylineDistanceMeters(waypoints: LatLng[]): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += calculateDistanceMeters(waypoints[i], waypoints[i + 1]);
  }
  return total;
}

/**
 * Calculates polygon area in square meters using spherical Shoelace formula
 */
export function calculatePolygonAreaMeters(polygon: LatLng[]): number {
  if (polygon.length < 3) return 0;
  const R = 6378137;
  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % n];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lng1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lng2 = (p2[1] * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (Math.abs(area) * R * R) / 2;
  return area;
}

/**
 * Calculates perimeter length of polygon in meters
 */
export function calculatePolygonPerimeterMeters(polygon: LatLng[]): number {
  if (polygon.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const next = polygon[(i + 1) % polygon.length];
    perimeter += calculateDistanceMeters(polygon[i], next);
  }
  return perimeter;
}

/**
 * Generates an approximated circle polygon given center and radius in meters
 */
export function generateCirclePolygon(center: LatLng, radiusMeters: number, numPoints = 32): LatLng[] {
  const points: LatLng[] = [];
  const latR = (center[0] * Math.PI) / 180;
  const lngR = (center[1] * Math.PI) / 180;
  const d = radiusMeters / 6371000; // angular distance in radians

  for (let i = 0; i < numPoints; i++) {
    const bearing = (i * 2 * Math.PI) / numPoints;
    const lat = Math.asin(
      Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(bearing),
    );
    const lng =
      lngR +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(latR),
        Math.cos(d) - Math.sin(latR) * Math.sin(lat),
      );
    points.push([(lat * 180) / Math.PI, (lng * 180) / Math.PI]);
  }
  return points;
}
