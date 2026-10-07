import * as turf from "@turf/turf";
import type { LatLng } from "@/data/geography";
import type { BoundingBox } from "@/store/eventAuthoringStore";

export type GeometryValidationResult = {
  isValid: boolean;
  error?: string;
  areaSqKm: number;
  perimeterKm: number;
  center: LatLng;
  boundingBox: BoundingBox;
};

export class GeometryEngine {
  /**
   * Convert LatLng[] to Turf Feature<Polygon>
   */
  public static toTurfPolygon(points: LatLng[]) {
    if (!points || points.length < 3) return null;

    // Close ring if not closed
    const ring = points.map((p) => [p[1], p[0]]); // Turf uses [lng, lat]
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([...first]);
    }

    try {
      return turf.polygon([ring]);
    } catch {
      return null;
    }
  }

  /**
   * Check if a LatLng point is inside a polygon boundary
   */
  public static isPointInPolygon(point: LatLng, polygonPoints: LatLng[]): boolean {
    if (!point || !polygonPoints || polygonPoints.length < 3) return false;
    const pt = turf.point([point[1], point[0]]);
    const poly = this.toTurfPolygon(polygonPoints);
    if (!poly) return false;
    try {
      return turf.booleanPointInPolygon(pt, poly);
    } catch {
      return false;
    }
  }

  /**
   * Calculate Area in Sq Km
   */
  public static calculateAreaSqKm(points: LatLng[]): number {
    const poly = this.toTurfPolygon(points);
    if (!poly) return 0;
    const areaSqMeters = turf.area(poly);
    return Math.round((areaSqMeters / 1_000_000) * 1000) / 1000;
  }

  /**
   * Calculate distance in meters between two LatLng points
   */
  public static calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
    if (!p1 || !p2) return 0;
    const from = turf.point([p1[1], p1[0]]);
    const to = turf.point([p2[1], p2[0]]);
    return Math.round(turf.distance(from, to, { units: "meters" }));
  }

  /**
   * Calculate Perimeter in Km
   */
  public static calculatePerimeterKm(points: LatLng[]): number {
    const poly = this.toTurfPolygon(points);
    if (!poly) return 0;
    const line = turf.polygonToLine(poly);
    const lengthKm = turf.length(line, { units: "kilometers" });
    return Math.round(lengthKm * 100) / 100;
  }

  /**
   * Calculate Bounding Box of LatLng points
   */
  public static getBoundingBox(points: LatLng[]): BoundingBox {
    if (!points || points.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }
    let north = -90;
    let south = 90;
    let east = -180;
    let west = 180;
    points.forEach(([lat, lng]) => {
      if (lat > north) north = lat;
      if (lat < south) south = lat;
      if (lng > east) east = lng;
      if (lng < west) west = lng;
    });
    return { north, south, east, west };
  }

  /**
   * Calculate Center of Mass
   */
  public static calculateCenter(points: LatLng[]): LatLng {
    if (!points || points.length === 0) return [20.5937, 78.9629];
    const poly = this.toTurfPolygon(points);
    if (!poly) {
      const avgLat = points.reduce((s, p) => s + p[0], 0) / points.length;
      const avgLng = points.reduce((s, p) => s + p[1], 0) / points.length;
      return [avgLat, avgLng];
    }
    const centerPoint = turf.centerOfMass(poly);
    const [lng, lat] = centerPoint.geometry.coordinates;
    return [lat, lng];
  }

  /**
   * Calculate Bounding Box
   */
  public static calculateBoundingBox(points: LatLng[]): BoundingBox {
    if (!points || points.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }
    const poly = this.toTurfPolygon(points);
    if (!poly) {
      const lats = points.map((p) => p[0]);
      const lngs = points.map((p) => p[1]);
      return {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      };
    }
    const [west, south, east, north] = turf.bbox(poly);
    return { north, south, east, west };
  }

  /**
   * Validate Polygon Geometry (Self-intersection, Zero area, Point count)
   */
  public static validatePolygon(points: LatLng[]): GeometryValidationResult {
    if (!points || points.length < 3) {
      return {
        isValid: false,
        error: "At least 3 coordinates are required to form a spatial region.",
        areaSqKm: 0,
        perimeterKm: 0,
        center: [0, 0],
        boundingBox: { north: 0, south: 0, east: 0, west: 0 },
      };
    }

    const poly = this.toTurfPolygon(points);
    if (!poly) {
      return {
        isValid: false,
        error: "Invalid polygon geometry structure.",
        areaSqKm: 0,
        perimeterKm: 0,
        center: [0, 0],
        boundingBox: { north: 0, south: 0, east: 0, west: 0 },
      };
    }

    // Self-intersection check
    const kinks = turf.kinks(poly);
    if (kinks.features.length > 0) {
      return {
        isValid: false,
        error: "Polygon boundary intersects with itself. Please adjust boundary handles.",
        areaSqKm: this.calculateAreaSqKm(points),
        perimeterKm: this.calculatePerimeterKm(points),
        center: this.calculateCenter(points),
        boundingBox: this.calculateBoundingBox(points),
      };
    }

    const area = this.calculateAreaSqKm(points);
    if (area <= 0.00001) {
      return {
        isValid: false,
        error: "Region area is zero or near-zero.",
        areaSqKm: area,
        perimeterKm: this.calculatePerimeterKm(points),
        center: this.calculateCenter(points),
        boundingBox: this.calculateBoundingBox(points),
      };
    }

    return {
      isValid: true,
      areaSqKm: area,
      perimeterKm: this.calculatePerimeterKm(points),
      center: this.calculateCenter(points),
      boundingBox: this.calculateBoundingBox(points),
    };
  }

  /**
   * Generate Circle Polygon (Center LatLng + Radius in Meters)
   */
  public static createCirclePolygon(center: LatLng, radiusMeters: number): LatLng[] {
    const centerPoint = turf.point([center[1], center[0]]);
    const circleTurf = turf.circle(centerPoint, radiusMeters / 1000, {
      steps: 64,
      units: "kilometers",
    });
    const coords = circleTurf.geometry.coordinates[0];
    return coords.map((c: number[]) => [c[1], c[0]] as LatLng);
  }

  /**
   * Generate Ellipse Polygon (Center + Major Axis Meters + Minor Axis Meters + Rotation Deg)
   */
  public static createEllipsePolygon(
    center: LatLng,
    xSemiAxisMeters: number,
    ySemiAxisMeters: number,
    angleDegrees: number = 0,
  ): LatLng[] {
    const centerPoint = turf.point([center[1], center[0]]);
    const ellipseTurf = turf.ellipse(
      centerPoint,
      xSemiAxisMeters / 1000,
      ySemiAxisMeters / 1000,
      {
        angle: angleDegrees,
        steps: 64,
        units: "kilometers",
      },
    );
    const coords = ellipseTurf.geometry.coordinates[0];
    return coords.map((c: number[]) => [c[1], c[0]] as LatLng);
  }

  /**
   * Generate Rectangle Polygon from BoundingBox or Dragged Corner Handles
   */
  public static createRectangleFromBounds(north: number, south: number, east: number, west: number): LatLng[] {
    return [
      [north, west],
      [north, east],
      [south, east],
      [south, west],
    ];
  }

  /**
   * Simplify Freehand Geometry
   */
  public static simplifyFreehand(points: LatLng[], tolerance: number = 0.0001): LatLng[] {
    const poly = this.toTurfPolygon(points);
    if (!poly) return points;
    const simplified = turf.simplify(poly, { tolerance, highQuality: true });
    const coords = simplified.geometry.coordinates[0];
    return coords.map((c: number[]) => [c[1], c[0]] as LatLng);
  }

  /**
   * Zone Containment Validation (P0 requirement)
   * Validates whether a candidate zone is completely inside the event region polygon
   */
  public static isZoneInsideRegion(zoneBoundary: LatLng[], regionBoundary: LatLng[]): { isInside: boolean; error?: string } {
    if (!regionBoundary || regionBoundary.length < 3) {
      return { isInside: true }; // No event region constraint defined yet
    }
    if (!zoneBoundary || zoneBoundary.length < 3) {
      return { isInside: false, error: "Zone boundary is incomplete." };
    }

    const regionPoly = this.toTurfPolygon(regionBoundary);
    const zonePoly = this.toTurfPolygon(zoneBoundary);

    if (!regionPoly || !zonePoly) {
      return { isInside: false, error: "Invalid polygon geometry." };
    }

    // Check if zone polygon is completely inside event region
    const isContained = turf.booleanContains(regionPoly, zonePoly);
    if (isContained) {
      return { isInside: true };
    }

    // Check if zone points are inside region
    const zonePointsTurf = zoneBoundary.map((p) => turf.point([p[1], p[0]]));
    const pointsInsideCount = zonePointsTurf.filter((pt) => turf.booleanPointInPolygon(pt, regionPoly)).length;

    if (pointsInsideCount === 0) {
      return {
        isInside: false,
        error: "ZONE OUTSIDE EVENT REGION: The zone is completely outside the defined event region boundary.",
      };
    }

    return {
      isInside: false,
      error: "ZONE OUTSIDE EVENT REGION: Zone boundary extends beyond the event perimeter. Please constrain zone inside event region.",
    };
  }

  /**
   * Create Rectangle Polygon from Center LatLng + Width (m) + Height (m) + Rotation (deg)
   */
  public static createRectangleFromDimensions(
    center: LatLng,
    widthMeters: number,
    heightMeters: number,
    rotationDegrees: number = 0,
  ): LatLng[] {
    const centerPoint = turf.point([center[1], center[0]]);
    const halfW = widthMeters / 2 / 1000;
    const halfH = heightMeters / 2 / 1000;

    // Relative offset corners in kilometers
    const bboxCoords = [
      [-halfW, -halfH],
      [halfW, -halfH],
      [halfW, halfH],
      [-halfW, halfH],
    ];

    const corners: LatLng[] = bboxCoords.map(([dx, dy]) => {
      // Rotate corner offset if needed
      const rad = (rotationDegrees * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      const dest = turf.destination(centerPoint, Math.sqrt(rx * rx + ry * ry), (Math.atan2(rx, ry) * 180) / Math.PI, {
        units: "kilometers",
      });
      return [dest.geometry.coordinates[1], dest.geometry.coordinates[0]] as LatLng;
    });

    return corners;
  }

  /**
   * Create FOV Cone Polygon for CCTV camera (Apex + Arc Points)
   */
  public static createFOVConePolygon(
    center: LatLng,
    orientationDegrees: number,
    fovDegrees: number,
    radiusMeters: number,
  ): LatLng[] {
    const apexPoint = turf.point([center[1], center[0]]);
    const halfFov = fovDegrees / 2;
    const startAngle = orientationDegrees - halfFov;

    const points: LatLng[] = [center];
    const numSteps = 12;
    const stepAngle = fovDegrees / numSteps;

    for (let i = 0; i <= numSteps; i++) {
      const angle = startAngle + i * stepAngle;
      const dest = turf.destination(apexPoint, radiusMeters / 1000, angle, { units: "kilometers" });
      points.push([dest.geometry.coordinates[1], dest.geometry.coordinates[0]]);
    }

    return points;
  }

  /**
   * Calculate Zone Sensor Coverage Percentage
   */
  public static calculateZoneSensorCoverage(
    zoneBoundary: LatLng[],
    sensors: Array<{ lat: number; lng: number; fovDegrees: number; orientationDegrees: number; coverageRadiusMeters: number }>,
  ): { coveragePercent: number; coveredAreaSqM: number; totalAreaSqM: number } {
    if (!zoneBoundary || zoneBoundary.length < 3) {
      return { coveragePercent: 0, coveredAreaSqM: 0, totalAreaSqM: 0 };
    }

    const zonePoly = this.toTurfPolygon(zoneBoundary);
    if (!zonePoly) return { coveragePercent: 0, coveredAreaSqM: 0, totalAreaSqM: 0 };

    const totalAreaSqM = turf.area(zonePoly);
    if (totalAreaSqM <= 0 || !sensors || sensors.length === 0) {
      return { coveragePercent: 0, coveredAreaSqM: 0, totalAreaSqM: Math.round(totalAreaSqM) };
    }

    // Build sensor FOV cone polygons
    const conePolys = sensors
      .map((s) => {
        const conePoints = this.createFOVConePolygon([s.lat, s.lng], s.orientationDegrees, s.fovDegrees, s.coverageRadiusMeters);
        return this.toTurfPolygon(conePoints);
      })
      .filter((poly): poly is NonNullable<typeof poly> => poly !== null);

    if (conePolys.length === 0) {
      return { coveragePercent: 0, coveredAreaSqM: 0, totalAreaSqM: Math.round(totalAreaSqM) };
    }

    let unionCones = conePolys[0];
    for (let i = 1; i < conePolys.length; i++) {
      try {
        const u = turf.union(turf.featureCollection([unionCones, conePolys[i]]));
        if (u) unionCones = u as any;
      } catch {
        // Fallback
      }
    }

    try {
      const intersection = turf.intersect(turf.featureCollection([zonePoly, unionCones]));
      if (intersection) {
        const coveredAreaSqM = turf.area(intersection);
        const percent = Math.min(100, Math.round((coveredAreaSqM / totalAreaSqM) * 100));
        return {
          coveragePercent: percent,
          coveredAreaSqM: Math.round(coveredAreaSqM),
          totalAreaSqM: Math.round(totalAreaSqM),
        };
      }
    } catch {
      // Fallback estimate
    }

    // Simple heuristic fallback based on sensor count vs area
    const estimatedPercent = Math.min(100, sensors.length * 30);
    return {
      coveragePercent: estimatedPercent,
      coveredAreaSqM: Math.round((totalAreaSqM * estimatedPercent) / 100),
      totalAreaSqM: Math.round(totalAreaSqM),
    };
  }
}

