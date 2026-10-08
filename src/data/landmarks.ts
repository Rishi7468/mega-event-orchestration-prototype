export type EventLandmarkCategory = "religious" | "temple" | "cultural" | "food" | "pavilion";

export type EventLandmark = {
  id: string;
  name: string;
  zoneId: string;
  category: EventLandmarkCategory;
  coordinates: [number, number];
  priorityScore: number; // Base importance score (1-100)
  estimatedDwellMinutes: number; // Average duration spent at landmark
  description: string;
};

export const mahaKumbhLandmarks: EventLandmark[] = [
  {
    id: "sangam",
    name: "Sangam Bathing Ghat",
    zoneId: "central",
    category: "religious",
    coordinates: [25.4228, 81.8874],
    priorityScore: 95,
    estimatedDwellMinutes: 45,
    description: "The primary holy confluence of the Ganga, Yamuna, and Saraswati rivers.",
  },
  {
    id: "temple",
    name: "Akshayavat Sacred Temple",
    zoneId: "south",
    category: "temple",
    coordinates: [25.3992, 81.8746],
    priorityScore: 85,
    estimatedDwellMinutes: 35,
    description: "Ancient sacred banyan tree inside the Patalpuri temple complex.",
  },
  {
    id: "cultural",
    name: "Cultural Arena & Exhibition",
    zoneId: "east",
    category: "cultural",
    coordinates: [25.4338, 81.9204],
    priorityScore: 75,
    estimatedDwellMinutes: 40,
    description: "National heritage performance stage, handicraft stalls, and art pavilions.",
  },
  {
    id: "food-market",
    name: "Annapurna Food Market",
    zoneId: "north",
    category: "food",
    coordinates: [25.4512, 81.8628],
    priorityScore: 70,
    estimatedDwellMinutes: 30,
    description: "Traditional vegetarian cuisine, regional delicacies, and refreshment hub.",
  },
  {
    id: "pavilion",
    name: "Shankaracharya Pavilion",
    zoneId: "central",
    category: "pavilion",
    coordinates: [25.4292, 81.8770],
    priorityScore: 65,
    estimatedDwellMinutes: 30,
    description: "Discourse halls and spiritual lecture assemblies.",
  },
];

export function getLandmarkById(id: string): EventLandmark | undefined {
  return mahaKumbhLandmarks.find((l) => l.id === id);
}
