import type { LatLng } from "@/data/geography";
import { POPULAR_VENUES, FEATURED_CITIES } from "@/data/locationCatalog";

export type ResolvedLocationCandidate = {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  center: LatLng;
  zoomLevel: number;
  source: "catalog" | "geocoder" | "coordinates";
  description: string;
};

export type LocationSearchResult = {
  query: string;
  resolved: ResolvedLocationCandidate | null;
  candidates: ResolvedLocationCandidate[];
  error?: string;
};

export class LocationProvider {
  /**
   * Primary search entry point
   * 1. Check direct coordinates (e.g., "19.0760, 72.8777")
   * 2. Search local catalog (cities, venues, landmarks)
   * 3. Fallback to fuzzy keyword matching
   */
  public static search(query: string): LocationSearchResult {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { query, resolved: null, candidates: [], error: "Empty query provided" };
    }

    // 1. Coordinate check
    const coordPattern = /^([-+]?\d{1,2}\.\d+)\s*,\s*([-+]?\d{1,3}\.\d+)$/;
    const coordMatch = cleanQuery.match(coordPattern);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const candidate: ResolvedLocationCandidate = {
          id: `coord-${lat}-${lng}`,
          name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          city: "Custom Location",
          state: "Spatial Coordinate",
          country: "India",
          center: [lat, lng],
          zoomLevel: 15,
          source: "coordinates",
          description: `Direct geographic coordinates [${lat}, ${lng}]`,
        };
        return {
          query,
          resolved: candidate,
          candidates: [candidate],
        };
      }
    }

    // 2. Search Local Catalog (POPULAR_VENUES)
    const matches: ResolvedLocationCandidate[] = [];

    POPULAR_VENUES.forEach((v) => {
      const vName = v.name.toLowerCase();
      const vCity = v.city.toLowerCase();
      const vState = v.state.toLowerCase();
      const vKeys = v.queryKeys ? v.queryKeys.map((k) => k.toLowerCase()) : [];

      if (
        vName.includes(cleanQuery) ||
        vCity.includes(cleanQuery) ||
        vState.includes(cleanQuery) ||
        vKeys.some((k) => k.includes(cleanQuery))
      ) {
        matches.push({
          id: `venue-${v.id}`,
          name: v.name,
          city: v.city,
          state: v.state,
          country: "India",
          center: v.center,
          zoomLevel: v.zoom || 15,
          source: "catalog",
          description: `${v.category.toUpperCase()} • ${v.city}, ${v.state}`,
        });
      }
    });

    // 3. Featured Cities check
    FEATURED_CITIES.forEach((c) => {
      const cName = c.name.toLowerCase();
      const cState = c.state.toLowerCase();

      if (cName.includes(cleanQuery) || cState.includes(cleanQuery)) {
        const refVenue = POPULAR_VENUES.find((v) => v.id === c.id);
        if (refVenue) {
          if (!matches.some((m) => m.center[0] === refVenue.center[0] && m.center[1] === refVenue.center[1])) {
            matches.push({
              id: `city-${c.id}`,
              name: `${c.name} Area`,
              city: c.name,
              state: c.state,
              country: "India",
              center: refVenue.center,
              zoomLevel: refVenue.zoom || 13,
              source: "catalog",
              description: `Major Metropolitan Area • ${c.state}`,
            });
          }
        }
      }
    });

    if (matches.length > 0) {
      const exactMatch = matches.find(
        (m) => m.name.toLowerCase() === cleanQuery || m.city.toLowerCase() === cleanQuery,
      );
      const resolved = exactMatch || matches[0];

      return {
        query,
        resolved,
        candidates: matches,
      };
    }

    return {
      query,
      resolved: null,
      candidates: [],
      error: `Location "${query}" could not be resolved in venue or city index. Please refine your query or enter coordinates.`,
    };
  }

  /**
   * Reverse geocoding helper
   */
  public static reverseGeocode(lat: number, lng: number): ResolvedLocationCandidate {
    let closest: ResolvedLocationCandidate | null = null;
    let minDistance = Infinity;

    POPULAR_VENUES.forEach((item) => {
      const dLat = item.center[0] - lat;
      const dLng = item.center[1] - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: `rev-${lat}-${lng}`,
          name: `${item.name} Precinct`,
          city: item.city,
          state: item.state,
          country: "India",
          center: [lat, lng],
          zoomLevel: 14,
          source: "coordinates",
          description: `Approx ${Math.round(dist * 111)}km from ${item.name}`,
        };
      }
    });

    return (
      closest || {
        id: `rev-default-${lat}-${lng}`,
        name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        city: "Spatial Venue",
        state: "Region",
        country: "India",
        center: [lat, lng],
        zoomLevel: 14,
        source: "coordinates",
        description: "Direct coordinate selection",
      }
    );
  }
}
