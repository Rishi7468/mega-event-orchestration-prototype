import type { Property } from "@/types";

/**
 * Accommodation available inside each zone.
 *
 * Brands are fictional and exist only to make the planning experience read
 * like a real product — no real hotel company is represented here and no
 * booking, pricing or availability partner is integrated. Review scores and
 * quotes are simulated demo data, labelled as such in the UI.
 *
 * Prices sit around each zone's `averagePrice` in zones.ts, and
 * `shuttleWalkMinutes` stays consistent with that zone's `walkToHubMinutes`
 * in journey.ts, so a property never claims a shorter walk than the journey
 * the planner actually builds.
 */
export const properties: Property[] = [
  {
    id: "prop-central-1",
    name: "Sangam View Palace",
    brand: "Meridian Collection",
    zoneId: "central",
    pricePerNight: 4_500,
    availableRooms: 12,
    totalRooms: 180,
    distanceFromVenueKm: 1.1,
    shuttleWalkMinutes: 3,
    reviews: {
      score: 4.4,
      count: 412,
      quote: "Unbeatable for the ghats, but the streets outside are packed all day.",
    },
  },
  {
    id: "prop-central-2",
    name: "Triveni Grand",
    brand: "Triveni Hotels",
    zoneId: "central",
    pricePerNight: 4_900,
    availableRooms: 6,
    totalRooms: 140,
    distanceFromVenueKm: 1.6,
    shuttleWalkMinutes: 4,
    reviews: {
      score: 4.1,
      count: 268,
      quote: "Walkable to the venue. Expect queues at the lifts on event mornings.",
    },
  },

  {
    id: "prop-north-1",
    name: "Ganga Heritage Inn",
    brand: "Heritage Stays",
    zoneId: "north",
    pricePerNight: 2_600,
    availableRooms: 92,
    totalRooms: 160,
    distanceFromVenueKm: 8.6,
    shuttleWalkMinutes: 6,
    reviews: {
      score: 4.2,
      count: 331,
      quote: "Quiet nights and an easy shuttle in. Breakfast starts early enough.",
    },
  },
  {
    id: "prop-north-2",
    name: "North Gate Residency",
    brand: "Residency Group",
    zoneId: "north",
    pricePerNight: 2_900,
    availableRooms: 74,
    totalRooms: 124,
    distanceFromVenueKm: 8.9,
    shuttleWalkMinutes: 5,
    reviews: {
      score: 4.6,
      count: 284,
      quote: "Easy shuttle connection and much quieter than staying near Central.",
    },
  },
  {
    id: "prop-north-3",
    name: "Sangam Comforts",
    brand: "Comforts by Meridian",
    zoneId: "north",
    pricePerNight: 3_100,
    availableRooms: 58,
    totalRooms: 110,
    distanceFromVenueKm: 9.4,
    shuttleWalkMinutes: 8,
    reviews: {
      score: 4.0,
      count: 176,
      quote: "Comfortable rooms, though the walk to the hub adds up twice a day.",
    },
  },

  {
    id: "prop-east-1",
    name: "Riverside Budget Stay",
    brand: "Riverside Lodges",
    zoneId: "east",
    pricePerNight: 1_500,
    availableRooms: 210,
    totalRooms: 300,
    distanceFromVenueKm: 22.0,
    shuttleWalkMinutes: 11,
    reviews: {
      score: 3.7,
      count: 508,
      quote: "Cheap and clean. The bus in takes far longer than the map suggests.",
    },
  },
  {
    id: "prop-east-2",
    name: "East Gate Lodge",
    brand: "Riverside Lodges",
    zoneId: "east",
    pricePerNight: 1_700,
    availableRooms: 165,
    totalRooms: 240,
    distanceFromVenueKm: 24.5,
    shuttleWalkMinutes: 12,
    reviews: {
      score: 3.6,
      count: 297,
      quote: "Good value if you don't mind a long ride each way.",
    },
  },

  {
    id: "prop-south-1",
    name: "South Yamuna Retreat",
    brand: "Retreat Hospitality",
    zoneId: "south",
    pricePerNight: 2_100,
    availableRooms: 88,
    totalRooms: 150,
    distanceFromVenueKm: 15.2,
    shuttleWalkMinutes: 8,
    reviews: {
      score: 4.0,
      count: 214,
      quote: "Calm side of the river, with a reliable connector shuttle.",
    },
  },
  {
    id: "prop-south-2",
    name: "Southbank Inn",
    brand: "Southbank Hotels",
    zoneId: "south",
    pricePerNight: 2_300,
    availableRooms: 61,
    totalRooms: 105,
    distanceFromVenueKm: 16.0,
    shuttleWalkMinutes: 7,
    reviews: {
      score: 3.9,
      count: 158,
      quote: "Fine for a short stay. Crossing the bridge at peak hour is slow.",
    },
  },
];

export function getPropertiesInZone(zoneId: string): Property[] {
  return properties.filter((property) => property.zoneId === zoneId);
}

export function availabilityPercent(property: Property): number {
  return Math.round((property.availableRooms / property.totalRooms) * 100);
}
