import type { LatLng } from "@/data/geography";
import { POPULAR_VENUES } from "@/data/locationCatalog";

export type ResolvedLocation = {
  query: string;
  name: string;
  city: string;
  state?: string;
  center: LatLng;
  zoom: number;
  suggestedPolygon: LatLng[];
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  isExactMatch: boolean;
};

export class GeocodingService {
  public static search(query: string): ResolvedLocation | null {
    if (!query || query.trim() === "") return null;
    const q = query.toLowerCase().trim();

    // 1. Check if query is coordinate string e.g. "18.9438, 72.8232" or "24.8170 93.9368"
    const coordMatch = q.match(/^([-+]?\d+\.?\d*)[,\s]+([-+]?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return this.reverseGeocode(lat, lng);
      }
    }

    // 2. Exact or substring match in POPULAR_VENUES catalog
    const match = POPULAR_VENUES.find((loc) =>
      loc.queryKeys.some((k) => k.includes(q) || q.includes(k)) ||
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q)
    );

    if (match) {
      return {
        query,
        name: match.name,
        city: `${match.city}, ${match.state}`,
        state: match.state,
        center: match.center,
        zoom: match.zoom,
        suggestedPolygon: match.suggestedPolygon || this.createSquarePolygon(match.center, 0.01),
        boundingBox: match.boundingBox,
        isExactMatch: true,
      };
    }

    // 3. Fallback: Check state & city heuristic coordinates for India
    const regionGeoMap: Record<string, { name: string; center: LatLng; zoom: number }> = {
      manipur: { name: "Imphal Valley, Manipur", center: [24.8170, 93.9368], zoom: 12 },
      imphal: { name: "Imphal City, Manipur", center: [24.8170, 93.9368], zoom: 13 },
      mumbai: { name: "Mumbai Metropolitan Region", center: [18.9438, 72.8232], zoom: 13 },
      delhi: { name: "National Capital Region, Delhi", center: [28.6129, 77.2295], zoom: 13 },
      bengaluru: { name: "Bengaluru Urban Region", center: [12.9985, 77.5925], zoom: 13 },
      bangalore: { name: "Bengaluru Urban Region", center: [12.9985, 77.5925], zoom: 13 },
      ahmedabad: { name: "Ahmedabad City", center: [23.0915, 72.5975], zoom: 13 },
      kolkata: { name: "Kolkata Metropolitan Area", center: [22.5646, 88.3433], zoom: 13 },
      prayagraj: { name: "Prayagraj Sangam Region", center: [25.4255, 81.8820], zoom: 13 },
      hyderabad: { name: "Hyderabad Old City / IT Hub", center: [17.3616, 78.4747], zoom: 13 },
      chennai: { name: "Chennai Coastal Zone", center: [13.0499, 80.2824], zoom: 13 },
      jaipur: { name: "Jaipur Pink City Region", center: [26.9258, 75.8237], zoom: 13 },
      goa: { name: "Panaji / North Goa Coast", center: [15.4989, 73.8077], zoom: 12 },
      pune: { name: "Pune Metropolitan Region", center: [18.5204, 73.8567], zoom: 13 },
      kochi: { name: "Kochi Marine Promenade", center: [9.9312, 76.2673], zoom: 13 },
      guwahati: { name: "Guwahati Brahmaputra Bank", center: [26.1445, 91.7362], zoom: 13 },
    };

    const cleanQ = q.replace(/[^a-z]/g, "");
    for (const [key, geo] of Object.entries(regionGeoMap)) {
      if (cleanQ.includes(key) || key.includes(cleanQ)) {
        const poly = this.createSquarePolygon(geo.center, 0.015);
        return {
          query,
          name: geo.name,
          city: geo.name,
          center: geo.center,
          zoom: geo.zoom,
          suggestedPolygon: poly,
          boundingBox: {
            north: geo.center[0] + 0.015,
            south: geo.center[0] - 0.015,
            east: geo.center[1] + 0.015,
            west: geo.center[1] - 0.015,
          },
          isExactMatch: false,
        };
      }
    }

    // 4. Return null if location search failed completely (so UI can display "LOCATION NOT FOUND")
    return null;
  }

  public static reverseGeocode(lat: number, lng: number): ResolvedLocation {
    const nearest = POPULAR_VENUES.find((loc) => {
      const dLat = Math.abs(loc.center[0] - lat);
      const dLng = Math.abs(loc.center[1] - lng);
      return dLat < 0.05 && dLng < 0.05;
    });

    if (nearest) {
      return {
        query: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        name: nearest.name,
        city: `${nearest.city}, ${nearest.state}`,
        state: nearest.state,
        center: [lat, lng],
        zoom: 15,
        suggestedPolygon: nearest.suggestedPolygon || this.createSquarePolygon([lat, lng], 0.008),
        boundingBox: nearest.boundingBox,
        isExactMatch: true,
      };
    }

    const delta = 0.008;
    return {
      query: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: "Custom Coordinates",
      center: [lat, lng],
      zoom: 15,
      suggestedPolygon: this.createSquarePolygon([lat, lng], delta),
      boundingBox: {
        north: lat + delta,
        south: lat - delta,
        east: lng + delta,
        west: lng - delta,
      },
      isExactMatch: false,
    };
  }

  private static createSquarePolygon(center: LatLng, delta: number): LatLng[] {
    return [
      [center[0] + delta, center[1] - delta],
      [center[0] + delta, center[1] + delta],
      [center[0] - delta, center[1] + delta],
      [center[0] - delta, center[1] - delta],
    ];
  }
}
