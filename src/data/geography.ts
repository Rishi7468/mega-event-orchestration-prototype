import { PRIMARY_DESTINATION_ID } from "./destinations";

/**
 * Real-world geography for the modelled scenario.
 *
 * Everything here is anchored to actual coordinates around the Triveni Sangam
 * in Prayagraj, so the map is a real place with real streets and rivers under
 * it rather than four circles floating on a blank canvas. The *operational*
 * geometry — which stretch of ground counts as "North Zone", where the demo
 * gates and camera positions sit — is simulated prototype boundary data drawn
 * over that real base, not surveyed or official.
 *
 * Coordinates are [latitude, longitude], the order Leaflet expects.
 */
export type LatLng = [number, number];

export type ZoneGeometry = {
  zoneId: string;
  /** Label anchor and the point transport corridors radiate from. */
  center: LatLng;
  /** A closed ring; simulated operational boundary, not an official one. */
  boundary: LatLng[];
};

export type PointFeature = {
  id: string;
  position: LatLng;
};

export type CorridorGeometry = {
  routeId: string;
  path: LatLng[];
};

export type DestinationGeography = {
  destinationId: string;
  /** Where the map opens, and how far the visitor can pan away from it. */
  center: LatLng;
  zoom: number;
  boundsPadding: number;
  venue: PointFeature & { name: string };
  zones: ZoneGeometry[];
  gates: PointFeature[];
  cameras: PointFeature[];
  corridors: CorridorGeometry[];
};

const mahaKumbhGeography: DestinationGeography = {
  destinationId: PRIMARY_DESTINATION_ID,
  center: [25.4255, 81.8820],
  zoom: 12,
  boundsPadding: 0.09,

  venue: { id: "main-venue", name: "Main Ghat Venue", position: [25.4228, 81.8874] },

  zones: [
    {
      zoneId: "central",
      center: [25.4292, 81.8770],
      boundary: [
        [25.4382, 81.8672],
        [25.4368, 81.8878],
        [25.4276, 81.8934],
        [25.4192, 81.8880],
        [25.4188, 81.8724],
        [25.4278, 81.8648],
      ],
    },
    {
      zoneId: "north",
      center: [25.4512, 81.8628],
      boundary: [
        [25.4638, 81.8492],
        [25.4622, 81.8742],
        [25.4498, 81.8806],
        [25.4396, 81.8720],
        [25.4404, 81.8534],
        [25.4520, 81.8448],
      ],
    },
    {
      zoneId: "east",
      center: [25.4338, 81.9204],
      boundary: [
        [25.4452, 81.9062],
        [25.4438, 81.9346],
        [25.4306, 81.9412],
        [25.4212, 81.9308],
        [25.4224, 81.9078],
        [25.4344, 81.8994],
      ],
    },
    {
      zoneId: "south",
      center: [25.3892, 81.8716],
      boundary: [
        [25.4008, 81.8574],
        [25.3994, 81.8858],
        [25.3862, 81.8918],
        [25.3768, 81.8812],
        [25.3782, 81.8592],
        [25.3900, 81.8506],
      ],
    },
  ],

  gates: [
    { id: "gate-a", position: [25.4258, 81.8818] },
    { id: "gate-b", position: [25.4306, 81.8862] },
  ],

  cameras: [
    { id: "cam-07", position: [25.4276, 81.8796] },
    { id: "cam-03", position: [25.4472, 81.8664] },
    { id: "cam-12", position: [25.4330, 81.9126] },
  ],

  /**
   * Approximate corridor alignments — each one starts at its zone's transit
   * hub and ends at the venue, following the same road/bridge crossings the
   * real approaches use.
   */
  corridors: [
    {
      routeId: "route-s1",
      path: [
        [25.4330, 81.8722],
        [25.4292, 81.8778],
        [25.4256, 81.8824],
        [25.4228, 81.8874],
      ],
    },
    {
      routeId: "route-s3",
      path: [
        [25.4472, 81.8664],
        [25.4408, 81.8712],
        [25.4344, 81.8790],
        [25.4306, 81.8862],
        [25.4228, 81.8874],
      ],
    },
    {
      routeId: "route-east-bus",
      path: [
        [25.4330, 81.9126],
        [25.4300, 81.9006],
        [25.4262, 81.8930],
        [25.4228, 81.8874],
      ],
    },
    {
      routeId: "route-south-shuttle",
      path: [
        [25.3892, 81.8716],
        [25.4022, 81.8764],
        [25.4136, 81.8828],
        [25.4228, 81.8874],
      ],
    },
  ],
};

const geographies: DestinationGeography[] = [mahaKumbhGeography];

/**
 * Operational geography exists only for the fully modelled scenario. Other
 * events still get a real base map (from `destination.geo`), just without
 * zones, gates and corridors drawn over it — the honest position, rather
 * than inventing boundaries for events we have no data for.
 */
export function getDestinationGeography(
  destinationId: string | null | undefined,
): DestinationGeography | undefined {
  if (!destinationId) return undefined;
  return geographies.find((geography) => geography.destinationId === destinationId);
}

export const primaryGeography = mahaKumbhGeography;
