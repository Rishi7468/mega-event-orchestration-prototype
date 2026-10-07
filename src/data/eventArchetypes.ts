import type { EventType } from "@/store/eventAuthoringStore";

export type EventArchetype = {
  id: string;
  name: string;
  eventType: EventType;
  description: string;
  recommendedZoneTypes: Array<{
    name: string;
    code: string;
    type: "transit" | "venue" | "accommodation" | "mixed" | "emergency";
    capacityShare: number; // e.g. 0.35
    riskLevel: "low" | "medium" | "high" | "critical";
  }>;
  recommendedResources: Array<{
    type: string;
    countPer10kVisitors: number;
  }>;
};

export const EVENT_ARCHETYPES: EventArchetype[] = [
  {
    id: "archetype-pilgrimage",
    name: "Pilgrimage / Sacred Gathering",
    eventType: "religious",
    description: "Mass congregation near rivers, ghats or temples with continuous inflow and large-scale accommodation staging.",
    recommendedZoneTypes: [
      { name: "Sacred Bathing / Ghat Core", code: "ZONE A", type: "venue", capacityShare: 0.40, riskLevel: "critical" },
      { name: "Transit Terminal & Shuttle Hub", code: "ZONE B", type: "transit", capacityShare: 0.30, riskLevel: "high" },
      { name: "Camp Encampment & Staging", code: "ZONE C", type: "accommodation", capacityShare: 0.20, riskLevel: "medium" },
      { name: "Emergency Response Corridor", code: "ZONE D", type: "emergency", capacityShare: 0.10, riskLevel: "low" },
    ],
    recommendedResources: [
      { type: "gate", countPer10kVisitors: 4 },
      { type: "medical", countPer10kVisitors: 2 },
      { type: "cctv", countPer10kVisitors: 6 },
      { type: "field_team", countPer10kVisitors: 4 },
      { type: "volunteer", countPer10kVisitors: 10 },
    ],
  },
  {
    id: "archetype-marathon",
    name: "Marathon / Road Race",
    eventType: "marathon",
    description: "Linear course along city avenues with start/finish hubs, hydration stations, and rolling road closures.",
    recommendedZoneTypes: [
      { name: "Start Line & Holding Pen", code: "ZONE A", type: "transit", capacityShare: 0.35, riskLevel: "medium" },
      { name: "Mid-Course Spectator Corridor", code: "ZONE B", type: "venue", capacityShare: 0.35, riskLevel: "medium" },
      { name: "Finish Line & Recovery Village", code: "ZONE C", type: "venue", capacityShare: 0.30, riskLevel: "high" },
    ],
    recommendedResources: [
      { type: "checkpoint", countPer10kVisitors: 5 },
      { type: "medical", countPer10kVisitors: 3 },
      { type: "first_aid", countPer10kVisitors: 4 },
      { type: "cctv", countPer10kVisitors: 4 },
      { type: "volunteer", countPer10kVisitors: 12 },
    ],
  },
  {
    id: "archetype-music-festival",
    name: "Music Festival",
    eventType: "music_festival",
    description: "Multi-stage outdoor arena with acoustic bowls, food villages, security checkpoints, and night egress surge.",
    recommendedZoneTypes: [
      { name: "Main Stage Bowl", code: "ZONE A", type: "venue", capacityShare: 0.50, riskLevel: "critical" },
      { name: "Food & Experience Concourse", code: "ZONE B", type: "mixed", capacityShare: 0.30, riskLevel: "low" },
      { name: "Entry Turnstiles & Parking", code: "ZONE C", type: "transit", capacityShare: 0.20, riskLevel: "medium" },
    ],
    recommendedResources: [
      { type: "entry", countPer10kVisitors: 6 },
      { type: "security_post", countPer10kVisitors: 3 },
      { type: "medical", countPer10kVisitors: 2 },
      { type: "cctv", countPer10kVisitors: 5 },
      { type: "barricade", countPer10kVisitors: 8 },
    ],
  },
  {
    id: "archetype-stadium",
    name: "Stadium / Arena Event",
    eventType: "sports",
    description: "Enclosed arena with high turnstile ingress rate, outer security perimeter, and heavy shuttle terminal load.",
    recommendedZoneTypes: [
      { name: "Stadium Bowl & Gates", code: "ZONE A", type: "venue", capacityShare: 0.60, riskLevel: "high" },
      { name: "Outer Security Concourse", code: "ZONE B", type: "mixed", capacityShare: 0.25, riskLevel: "medium" },
      { name: "Metro / Transport Hub", code: "ZONE C", type: "transit", capacityShare: 0.15, riskLevel: "high" },
    ],
    recommendedResources: [
      { type: "gate", countPer10kVisitors: 8 },
      { type: "cctv", countPer10kVisitors: 10 },
      { type: "field_team", countPer10kVisitors: 5 },
      { type: "police", countPer10kVisitors: 4 },
    ],
  },
  {
    id: "archetype-parade",
    name: "Parade / Procession",
    eventType: "parade",
    description: "Moving float corridor with spectator barricades, street intersections, and crowd dispersal avenues.",
    recommendedZoneTypes: [
      { name: "Procession Route Corridor", code: "ZONE A", type: "venue", capacityShare: 0.60, riskLevel: "high" },
      { name: "VIP Stand & Main Assembly", code: "ZONE B", type: "mixed", capacityShare: 0.25, riskLevel: "medium" },
      { name: "Feeder Roads & Egress", code: "ZONE C", type: "transit", capacityShare: 0.15, riskLevel: "low" },
    ],
    recommendedResources: [
      { type: "barricade", countPer10kVisitors: 10 },
      { type: "crowd_marshal", countPer10kVisitors: 8 },
      { type: "police", countPer10kVisitors: 5 },
      { type: "medical", countPer10kVisitors: 2 },
    ],
  },
  {
    id: "archetype-exhibition",
    name: "Exhibition / Trade Fair",
    eventType: "exhibition",
    description: "Indoor/outdoor convention halls with registered attendee check-in, freight access, and continuous circulation.",
    recommendedZoneTypes: [
      { name: "Exhibition Halls 1-4", code: "ZONE A", type: "venue", capacityShare: 0.50, riskLevel: "low" },
      { name: "Registration Plaza", code: "ZONE B", type: "transit", capacityShare: 0.30, riskLevel: "medium" },
      { name: "Freight & Logistics Gate", code: "ZONE C", type: "emergency", capacityShare: 0.20, riskLevel: "low" },
    ],
    recommendedResources: [
      { type: "info_desk", countPer10kVisitors: 4 },
      { type: "entry", countPer10kVisitors: 6 },
      { type: "cctv", countPer10kVisitors: 4 },
    ],
  },
  {
    id: "archetype-campus",
    name: "Campus / University Fest",
    eventType: "campus",
    description: "Multi-building university grounds with distributed stages, food courts, and student volunteer marshals.",
    recommendedZoneTypes: [
      { name: "Central Auditorium & Stage", code: "ZONE A", type: "venue", capacityShare: 0.45, riskLevel: "medium" },
      { name: "Quadrangle Food Plaza", code: "ZONE B", type: "mixed", capacityShare: 0.35, riskLevel: "low" },
      { name: "Main Campus Arch Entry", code: "ZONE C", type: "transit", capacityShare: 0.20, riskLevel: "medium" },
    ],
    recommendedResources: [
      { type: "volunteer", countPer10kVisitors: 15 },
      { type: "first_aid", countPer10kVisitors: 3 },
      { type: "cctv", countPer10kVisitors: 4 },
    ],
  },
  {
    id: "archetype-rally",
    name: "Political / Public Rally",
    eventType: "political",
    description: "High-density public address gathering with stage security buffer, approach arterial roads, and VIP escort corridors.",
    recommendedZoneTypes: [
      { name: "Main Rally Dais & Podium", code: "ZONE A", type: "venue", capacityShare: 0.55, riskLevel: "critical" },
      { name: "Approach Road Assembly", code: "ZONE B", type: "transit", capacityShare: 0.30, riskLevel: "high" },
      { name: "VIP Exit & Buffer Zone", code: "ZONE C", type: "emergency", capacityShare: 0.15, riskLevel: "medium" },
    ],
    recommendedResources: [
      { type: "police", countPer10kVisitors: 10 },
      { type: "security_post", countPer10kVisitors: 6 },
      { type: "barricade", countPer10kVisitors: 12 },
      { type: "ambulance_stand", countPer10kVisitors: 3 },
    ],
  },
  {
    id: "archetype-fair",
    name: "Fair / Carnival / Mela",
    eventType: "fair_mela",
    description: "Family attractions, ride zones, food stalls, and multi-entrance pedestrian walkways.",
    recommendedZoneTypes: [
      { name: "Amusement Rides Sector", code: "ZONE A", type: "venue", capacityShare: 0.40, riskLevel: "medium" },
      { name: "Bazaar & Food Concourse", code: "ZONE B", type: "mixed", capacityShare: 0.40, riskLevel: "low" },
      { name: "Parking & Bus Terminal", code: "ZONE C", type: "transit", capacityShare: 0.20, riskLevel: "medium" },
    ],
    recommendedResources: [
      { type: "lost_found", countPer10kVisitors: 2 },
      { type: "info_desk", countPer10kVisitors: 4 },
      { type: "medical", countPer10kVisitors: 2 },
      { type: "toilet", countPer10kVisitors: 6 },
    ],
  },
  {
    id: "archetype-custom",
    name: "Custom Event Model",
    eventType: "custom",
    description: "Blank operational spatial canvas for specialized or unlisted mega-events.",
    recommendedZoneTypes: [],
    recommendedResources: [],
  },
];

export function getArchetypeForEventType(type: EventType): EventArchetype {
  return EVENT_ARCHETYPES.find((a) => a.eventType === type) ?? EVENT_ARCHETYPES[EVENT_ARCHETYPES.length - 1];
}
