import type { EventType, OperationalZoneDefinition, PlacedRoute } from "@/store/eventAuthoringStore";
import type { LatLng } from "@/data/geography";

export type EventPreset = {
  id: string;
  name: string;
  type: EventType;
  expectedAttendance: number;
  eventDate: string;
  eventDurationHours: number;
  locationName: string;
  centerCoordinates: LatLng;
  regionPolygon: LatLng[];
  zones: OperationalZoneDefinition[];
  routes?: PlacedRoute[];
  description: string;
};

export type GeocodedLocationTarget = {
  query: string;
  name: string;
  city: string;
  center: LatLng;
  suggestedPolygon: LatLng[];
};

export const GEOCODED_SEARCH_TARGETS: GeocodedLocationTarget[] = [
  {
    query: "mumbai",
    name: "Marine Drive Promenade",
    city: "Mumbai, MH",
    center: [18.9438, 72.8232],
    suggestedPolygon: [
      [18.9550, 72.8150],
      [18.9550, 72.8350],
      [18.9320, 72.8350],
      [18.9320, 72.8150],
    ],
  },
  {
    query: "prayagraj",
    name: "Triveni Sangam Grounds",
    city: "Prayagraj, UP",
    center: [25.4255, 81.8820],
    suggestedPolygon: [
      [25.465, 81.845],
      [25.465, 81.945],
      [25.370, 81.945],
      [25.370, 81.845],
    ],
  },
  {
    query: "bangalore",
    name: "Palace Grounds Amphitheater",
    city: "Bengaluru, KA",
    center: [12.9985, 77.5925],
    suggestedPolygon: [
      [13.0080, 77.5830],
      [13.0080, 77.6020],
      [12.9890, 77.6020],
      [12.9890, 77.5830],
    ],
  },
  {
    query: "ahmedabad",
    name: "Narendra Modi Stadium Sector",
    city: "Ahmedabad, GJ",
    center: [23.0915, 72.5975],
    suggestedPolygon: [
      [23.1020, 72.5880],
      [23.1020, 72.6070],
      [23.0810, 72.6070],
      [23.0810, 72.5880],
    ],
  },
  {
    query: "delhi",
    name: "Kartavya Path & India Gate Lawns",
    city: "New Delhi, DL",
    center: [28.6129, 77.2295],
    suggestedPolygon: [
      [28.6220, 77.2180],
      [28.6220, 77.2410],
      [28.6030, 77.2410],
      [28.6030, 77.2180],
    ],
  },
  {
    query: "kolkata",
    name: "Eden Gardens & Maidan Grounds",
    city: "Kolkata, WB",
    center: [22.5646, 88.3433],
    suggestedPolygon: [
      [22.5740, 88.3340],
      [22.5740, 88.3520],
      [22.5530, 88.3520],
      [22.5530, 88.3340],
    ],
  },
];

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: "preset-maha-kumbh",
    name: "Maha Kumbh Parv — Command Operation",
    type: "religious",
    expectedAttendance: 1250000,
    eventDate: "2026-10-06",
    eventDurationHours: 18,
    locationName: "Triveni Sangam, Prayagraj",
    centerCoordinates: [25.4255, 81.8820],
    regionPolygon: [
      [25.465, 81.845],
      [25.465, 81.945],
      [25.370, 81.945],
      [25.370, 81.845],
    ],
    zones: [
      {
        id: "central",
        name: "Central Sangam Sector",
        code: "ZONE A",
        type: "venue",
        capacity: 45000,
        currentPopulation: 38250,
        ingressRatePerMin: 420,
        egressRatePerMin: 180,
        cctvCount: 14,
        fieldTeamCount: 8,
        medicalUnitsCount: 3,
        emergencyAccess: "constrained",
        riskLevel: "critical",
        boundary: [
          [25.4382, 81.8672],
          [25.4368, 81.8878],
          [25.4276, 81.8934],
          [25.4192, 81.8880],
          [25.4188, 81.8724],
          [25.4278, 81.8648],
        ],
        elevationMeters: 45,
      },
      {
        id: "north",
        name: "North Transit & Hub",
        code: "ZONE B",
        type: "transit",
        capacity: 35000,
        currentPopulation: 16800,
        ingressRatePerMin: 210,
        egressRatePerMin: 240,
        cctvCount: 9,
        fieldTeamCount: 5,
        medicalUnitsCount: 2,
        emergencyAccess: "clear",
        riskLevel: "medium",
        boundary: [
          [25.4638, 81.8492],
          [25.4622, 81.8742],
          [25.4498, 81.8806],
          [25.4396, 81.8720],
          [25.4404, 81.8534],
          [25.4520, 81.8448],
        ],
        elevationMeters: 38,
      },
      {
        id: "east",
        name: "East Concourse & Parking",
        code: "ZONE C",
        type: "mixed",
        capacity: 30000,
        currentPopulation: 12600,
        ingressRatePerMin: 150,
        egressRatePerMin: 160,
        cctvCount: 6,
        fieldTeamCount: 4,
        medicalUnitsCount: 1,
        emergencyAccess: "clear",
        riskLevel: "low",
        boundary: [
          [25.4452, 81.9062],
          [25.4438, 81.9346],
          [25.4306, 81.9412],
          [25.4212, 81.9308],
          [25.4224, 81.9078],
          [25.4344, 81.8994],
        ],
        elevationMeters: 32,
      },
      {
        id: "south",
        name: "South Encampment & Staging",
        code: "ZONE D",
        type: "accommodation",
        capacity: 40000,
        currentPopulation: 18400,
        ingressRatePerMin: 120,
        egressRatePerMin: 110,
        cctvCount: 7,
        fieldTeamCount: 3,
        medicalUnitsCount: 2,
        emergencyAccess: "clear",
        riskLevel: "low",
        boundary: [
          [25.4008, 81.8574],
          [25.3994, 81.8858],
          [25.3862, 81.8918],
          [25.3768, 81.8812],
          [25.3782, 81.8592],
          [25.3900, 81.8506],
        ],
        elevationMeters: 28,
      },
    ],
    routes: [
      {
        id: "route-sangam-emerg",
        name: "Sangam Emergency Ambulance Route",
        type: "emergency",
        color: "#ef4444",
        status: "clear",
        waypoints: [
          [25.4300, 81.8780],
          [25.4350, 81.8742],
          [25.4450, 81.8650],
          [25.4550, 81.8500],
        ],
      },
    ],
    description: "Mass-gathering spiritual event with heavy riverbank concentration and multi-corridor transit feeder flows.",
  },
  {
    id: "preset-city-marathon",
    name: "Metropolitan International Marathon 2026",
    type: "sports",
    expectedAttendance: 65000,
    eventDate: "2026-11-15",
    eventDurationHours: 8,
    locationName: "Marine Drive Promenade, Mumbai",
    centerCoordinates: [18.9438, 72.8232],
    regionPolygon: [
      [18.9550, 72.8150],
      [18.9550, 72.8350],
      [18.9320, 72.8350],
      [18.9320, 72.8150],
    ],
    zones: [
      {
        id: "mumbai-start",
        name: "Nariman Point Start Line",
        code: "ZONE A",
        type: "transit",
        capacity: 25000,
        currentPopulation: 18000,
        ingressRatePerMin: 350,
        egressRatePerMin: 280,
        cctvCount: 10,
        fieldTeamCount: 6,
        medicalUnitsCount: 4,
        emergencyAccess: "clear",
        riskLevel: "medium",
        boundary: [
          [18.9480, 72.8200],
          [18.9480, 72.8280],
          [18.9400, 72.8280],
          [18.9400, 72.8200],
        ],
        elevationMeters: 10,
      },
      {
        id: "mumbai-promenade",
        name: "Marine Drive Spectator Corridor",
        code: "ZONE B",
        type: "venue",
        capacity: 20000,
        currentPopulation: 14500,
        ingressRatePerMin: 190,
        egressRatePerMin: 170,
        cctvCount: 8,
        fieldTeamCount: 4,
        medicalUnitsCount: 2,
        emergencyAccess: "constrained",
        riskLevel: "medium",
        boundary: [
          [18.9540, 72.8220],
          [18.9540, 72.8320],
          [18.9480, 72.8320],
          [18.9480, 72.8220],
        ],
        elevationMeters: 12,
      },
      {
        id: "mumbai-finish",
        name: "Chowpatty Finish Arena",
        code: "ZONE C",
        type: "venue",
        capacity: 15000,
        currentPopulation: 13200,
        ingressRatePerMin: 310,
        egressRatePerMin: 140,
        cctvCount: 12,
        fieldTeamCount: 7,
        medicalUnitsCount: 5,
        emergencyAccess: "clear",
        riskLevel: "high",
        boundary: [
          [18.9550, 72.8160],
          [18.9550, 72.8240],
          [18.9490, 72.8240],
          [18.9490, 72.8160],
        ],
        elevationMeters: 15,
      },
    ],
    routes: [
      {
        id: "route-marathon-course",
        name: "Marine Drive Marathon Race Track",
        type: "crowd_ingress",
        color: "#3b82f6",
        status: "clear",
        waypoints: [
          [18.9400, 72.8240],
          [18.9480, 72.8250],
          [18.9540, 72.8230],
        ],
      },
      {
        id: "route-mumbai-emerg",
        name: "Coastal Road Medical Evacuation Line",
        type: "emergency",
        color: "#ef4444",
        status: "clear",
        waypoints: [
          [18.9490, 72.8200],
          [18.9550, 72.8180],
        ],
      },
    ],
    description: "Linear sports event along Mumbai coastal boulevard with rolling road closures and high finish-line crowd density.",
  },
  {
    id: "preset-campus-music-fest",
    name: "Sunburn Campus Fest — Palace Grounds",
    type: "music_festival",
    expectedAttendance: 35000,
    eventDate: "2026-12-05",
    eventDurationHours: 12,
    locationName: "Palace Grounds Amphitheater, Bengaluru",
    centerCoordinates: [12.9985, 77.5925],
    regionPolygon: [
      [13.0080, 77.5830],
      [13.0080, 77.6020],
      [12.9890, 77.6020],
      [12.9890, 77.5830],
    ],
    zones: [
      {
        id: "blr-main-stage",
        name: "Main Stage Concert Bowl",
        code: "ZONE A",
        type: "venue",
        capacity: 18000,
        currentPopulation: 15800,
        ingressRatePerMin: 450,
        egressRatePerMin: 120,
        cctvCount: 11,
        fieldTeamCount: 8,
        medicalUnitsCount: 3,
        emergencyAccess: "constrained",
        riskLevel: "critical",
        boundary: [
          [13.0040, 77.5880],
          [13.0040, 77.5980],
          [12.9940, 77.5980],
          [12.9940, 77.5880],
        ],
        elevationMeters: 920,
      },
      {
        id: "blr-food-plaza",
        name: "Food & Experience Concourse",
        code: "ZONE B",
        type: "mixed",
        capacity: 12000,
        currentPopulation: 6400,
        ingressRatePerMin: 120,
        egressRatePerMin: 130,
        cctvCount: 6,
        fieldTeamCount: 3,
        medicalUnitsCount: 1,
        emergencyAccess: "clear",
        riskLevel: "low",
        boundary: [
          [13.0050, 77.5980],
          [13.0050, 77.6020],
          [12.9950, 77.6020],
          [12.9950, 77.5980],
        ],
        elevationMeters: 915,
      },
      {
        id: "blr-gate-transit",
        name: "Gate 2 Shuttle & Parking Terminal",
        code: "ZONE C",
        type: "transit",
        capacity: 8000,
        currentPopulation: 3100,
        ingressRatePerMin: 220,
        egressRatePerMin: 200,
        cctvCount: 5,
        fieldTeamCount: 4,
        medicalUnitsCount: 1,
        emergencyAccess: "clear",
        riskLevel: "low",
        boundary: [
          [12.9940, 77.5840],
          [12.9940, 77.5900],
          [12.9890, 77.5900],
          [12.9890, 77.5840],
        ],
        elevationMeters: 925,
      },
    ],
    routes: [
      {
        id: "route-blr-egress",
        name: "Palace Road Mass Evacuation Route",
        type: "evacuation",
        color: "#f97316",
        status: "clear",
        waypoints: [
          [12.9940, 77.5980],
          [12.9890, 77.5900],
        ],
      },
    ],
    description: "Multi-stage music festival in Bengaluru with high acoustic bowl crowd density and night-time egress surge.",
  },
];

export function searchGeocodedLocation(query: string): GeocodedLocationTarget | null {
  if (!query || query.trim() === "") return null;
  const q = query.toLowerCase().trim();
  const match = GEOCODED_SEARCH_TARGETS.find(
    (t) => t.query.includes(q) || t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q),
  );
  return match ?? null;
}
