import type { Destination } from "@/types";

/**
 * The catalogue of high-footfall events a visitor can plan to attend.
 *
 * This is what stops the product reading as a single-event application. Maha
 * Kumbh remains the primary demo scenario and is the only entry with the full
 * orchestration dataset behind it (zones, transport, gates, cameras); the rest
 * are prototype records that prove the model generalises across categories —
 * religious gatherings, sports, conventions, cultural festivals and large
 * public celebrations. The UI is explicit about which scenario is fully
 * modelled rather than inventing operational data for the others.
 *
 * Every figure here is a deterministic demo value. Nothing implies the system
 * has live operational access to any of these events.
 */
export const destinations: Destination[] = [
  {
    id: "maha-kumbh",
    name: "Maha Kumbh",
    city: "Prayagraj",
    region: "Uttar Pradesh",
    eventType: "religious-gathering",
    dateRange: "13 Jan – 26 Feb",
    summary: "Major religious gathering at the Sangam",
    status: "normal",
    expectedVisitors: 4_000_000,
    demandLevel: "very-high",
    simulationReady: true,
    suggested: true,
    trending: {
      rank: 1,
      reason: "Expected attendance is rising ahead of the peak bathing day.",
    },
    geo: { center: [25.4245, 81.8835], zoom: 12 },
    outlook: [
      { id: "fri", label: "Fri", demandPercent: 68, note: "Build-up begins" },
      { id: "sat", label: "Sat", demandPercent: 88, note: "Weekend surge" },
      { id: "sun", label: "Sun", demandPercent: 92, note: "Peak bathing day" },
      { id: "mon", label: "Mon", demandPercent: 61, note: "Crowds ease off" },
      { id: "tue", label: "Tue", demandPercent: 54, note: "Quietest of the week" },
    ],
    arrivalWindows: [
      {
        id: "early",
        label: "6:30 – 8:00 AM",
        startHour: 6,
        pressurePercent: 34,
        note: "Quietest entry of the day, but a very early start",
      },
      {
        id: "mid-morning",
        label: "9:30 – 11:00 AM",
        startHour: 9,
        pressurePercent: 52,
        note: "Clears the gates before the late-morning build-up",
      },
      {
        id: "midday",
        label: "12:00 – 2:00 PM",
        startHour: 12,
        pressurePercent: 78,
        note: "Heavy queues at the main gates",
      },
      {
        id: "evening",
        label: "5:00 – 7:00 PM",
        startHour: 17,
        pressurePercent: 94,
        note: "Aarti peak — the busiest window",
      },
    ],
  },
  {
    id: "national-games",
    name: "National Games",
    city: "Ahmedabad",
    region: "Gujarat",
    eventType: "sports",
    dateRange: "18 – 30 Apr",
    summary: "Multi-venue national sporting event",
    status: "normal",
    expectedVisitors: 620_000,
    demandLevel: "high",
    simulationReady: false,
    suggested: true,
    trending: {
      rank: 2,
      reason: "Ticketed demand is climbing into the finals weekend.",
    },
    geo: { center: [23.0916, 72.5977], zoom: 12 },
    outlook: [
      { id: "fri", label: "Fri", demandPercent: 58, note: "Qualifying rounds" },
      { id: "sat", label: "Sat", demandPercent: 84, note: "Finals weekend" },
      { id: "sun", label: "Sun", demandPercent: 79, note: "Closing ceremony" },
      { id: "mon", label: "Mon", demandPercent: 47, note: "Heats only" },
    ],
    arrivalWindows: [
      {
        id: "afternoon",
        label: "2:00 – 3:30 PM",
        startHour: 14,
        pressurePercent: 46,
        note: "Between sessions",
      },
      {
        id: "evening",
        label: "6:00 – 7:30 PM",
        startHour: 18,
        pressurePercent: 88,
        note: "Evening finals — heaviest transport load",
      },
    ],
  },
  {
    id: "republic-day-parade",
    name: "Republic Day Parade",
    city: "New Delhi",
    region: "Delhi NCR",
    eventType: "celebration",
    dateRange: "23 – 26 Jan",
    summary: "National ceremonial parade and public celebration",
    status: "normal",
    expectedVisitors: 900_000,
    demandLevel: "very-high",
    simulationReady: false,
    suggested: true,
    trending: {
      rank: 3,
      reason: "Route-side viewing demand is rising as the date approaches.",
    },
    geo: { center: [28.6139, 77.2295], zoom: 13 },
    outlook: [
      { id: "thu", label: "Thu", demandPercent: 52, note: "Rehearsal day" },
      { id: "fri", label: "Fri", demandPercent: 66, note: "Full dress rehearsal" },
      { id: "sat", label: "Sat", demandPercent: 74, note: "Public build-up" },
      { id: "sun", label: "Sun", demandPercent: 96, note: "Parade day" },
    ],
    arrivalWindows: [
      {
        id: "early",
        label: "5:30 – 7:00 AM",
        startHour: 5,
        pressurePercent: 44,
        note: "Security screening opens — long but steady queues",
      },
      {
        id: "mid-morning",
        label: "8:30 – 9:30 AM",
        startHour: 8,
        pressurePercent: 91,
        note: "Approach roads close to traffic",
      },
    ],
  },
  {
    id: "mumbai-expo",
    name: "Mumbai International Expo",
    city: "Mumbai",
    region: "Maharashtra",
    eventType: "convention",
    dateRange: "4 – 9 Mar",
    summary: "Large trade convention across two halls",
    status: "normal",
    expectedVisitors: 180_000,
    demandLevel: "moderate",
    simulationReady: false,
    trending: {
      rank: 5,
      reason: "Exhibitor registrations are running ahead of last year's pace.",
    },
    geo: { center: [19.0619, 72.8697], zoom: 13 },
    outlook: [
      { id: "wed", label: "Wed", demandPercent: 44, note: "Opening day" },
      { id: "thu", label: "Thu", demandPercent: 58, note: "Trade sessions" },
      { id: "fri", label: "Fri", demandPercent: 71, note: "Busiest day" },
      { id: "sat", label: "Sat", demandPercent: 49, note: "Public day" },
    ],
    arrivalWindows: [
      {
        id: "early",
        label: "8:30 – 9:30 AM",
        startHour: 8,
        pressurePercent: 38,
        note: "Ahead of the session rush",
      },
      {
        id: "midday",
        label: "12:00 – 2:00 PM",
        startHour: 12,
        pressurePercent: 74,
        note: "Overlaps the keynote break",
      },
    ],
  },
  {
    id: "durga-puja-carnival",
    name: "Durga Puja Carnival",
    city: "Kolkata",
    region: "West Bengal",
    eventType: "celebration",
    dateRange: "8 – 13 Oct",
    summary: "City-wide pandal circuit and carnival procession",
    status: "normal",
    expectedVisitors: 1_400_000,
    demandLevel: "very-high",
    simulationReady: false,
    trending: {
      rank: 4,
      reason: "Evening pandal footfall is running above the seasonal average.",
    },
    geo: { center: [22.5726, 88.3639], zoom: 12 },
    outlook: [
      { id: "wed", label: "Wed", demandPercent: 63, note: "Circuit opens" },
      { id: "thu", label: "Thu", demandPercent: 81, note: "Peak pandal night" },
      { id: "fri", label: "Fri", demandPercent: 90, note: "Carnival procession" },
      { id: "sat", label: "Sat", demandPercent: 58, note: "Wind-down" },
    ],
    arrivalWindows: [
      {
        id: "afternoon",
        label: "1:00 – 3:00 PM",
        startHour: 13,
        pressurePercent: 39,
        note: "Quiet, but most pandals light up later",
      },
      {
        id: "evening",
        label: "7:00 – 9:30 PM",
        startHour: 19,
        pressurePercent: 93,
        note: "Peak procession window — expect road closures",
      },
    ],
  },
  {
    id: "pushkar-fair",
    name: "Pushkar Camel Fair",
    city: "Pushkar",
    region: "Rajasthan",
    eventType: "festival",
    dateRange: "2 – 9 Nov",
    summary: "Livestock fair and cultural festival",
    status: "normal",
    expectedVisitors: 350_000,
    demandLevel: "high",
    simulationReady: false,
    trending: {
      rank: 6,
      reason: "Interest is climbing steeply in the week before the trading peak.",
    },
    geo: { center: [26.4899, 74.5511], zoom: 13 },
    outlook: [
      { id: "sat", label: "Sat", demandPercent: 77, note: "Trading peak" },
      { id: "sun", label: "Sun", demandPercent: 69, note: "Cultural programme" },
      { id: "mon", label: "Mon", demandPercent: 45, note: "Quieter grounds" },
    ],
    arrivalWindows: [
      {
        id: "morning",
        label: "8:00 – 10:00 AM",
        startHour: 8,
        pressurePercent: 42,
        note: "Cooler, and far less congested at the ground entrances",
      },
      {
        id: "evening",
        label: "5:00 – 7:00 PM",
        startHour: 17,
        pressurePercent: 84,
        note: "Sunset programme draws the largest crowd",
      },
    ],
  },
  {
    id: "rann-utsav",
    name: "Rann Utsav",
    city: "Kutch",
    region: "Gujarat",
    eventType: "festival",
    dateRange: "1 Nov – 20 Feb",
    summary: "Desert cultural festival on the white salt flats",
    status: "normal",
    expectedVisitors: 450_000,
    demandLevel: "moderate",
    simulationReady: false,
    geo: { center: [23.7337, 69.8597], zoom: 12 },
    outlook: [
      { id: "fri", label: "Fri", demandPercent: 62, note: "Weekend arrivals" },
      { id: "sat", label: "Sat", demandPercent: 81, note: "Full-moon night" },
      { id: "sun", label: "Sun", demandPercent: 55, note: "Departures begin" },
    ],
    arrivalWindows: [
      {
        id: "afternoon",
        label: "3:00 – 4:30 PM",
        startHour: 15,
        pressurePercent: 41,
        note: "Before the sunset crowd",
      },
      {
        id: "evening",
        label: "6:00 – 8:00 PM",
        startHour: 18,
        pressurePercent: 86,
        note: "Sunset viewing peak",
      },
    ],
  },
  {
    id: "bengaluru-tech-summit",
    name: "Bengaluru Tech Summit",
    city: "Bengaluru",
    region: "Karnataka",
    eventType: "convention",
    dateRange: "19 – 21 Nov",
    summary: "Technology convention across a single campus",
    status: "normal",
    expectedVisitors: 95_000,
    demandLevel: "moderate",
    simulationReady: false,
    geo: { center: [12.9784, 77.5946], zoom: 13 },
    outlook: [
      { id: "tue", label: "Tue", demandPercent: 51, note: "Opening keynotes" },
      { id: "wed", label: "Wed", demandPercent: 64, note: "Busiest exhibition day" },
      { id: "thu", label: "Thu", demandPercent: 43, note: "Closing sessions" },
    ],
    arrivalWindows: [
      {
        id: "early",
        label: "8:00 – 9:00 AM",
        startHour: 8,
        pressurePercent: 36,
        note: "Ahead of the first keynote",
      },
      {
        id: "midday",
        label: "12:30 – 2:00 PM",
        startHour: 12,
        pressurePercent: 68,
        note: "Exhibition floor is at its busiest",
      },
    ],
  },
];

export const PRIMARY_DESTINATION_ID = "maha-kumbh";

/**
 * The scenario the operator surface is scoped to. The command center manages
 * one destination at a time, and this prototype models exactly one.
 */
export const primaryDestination: Destination = destinations.find(
  (destination) => destination.id === PRIMARY_DESTINATION_ID,
)!;

export function findDestination(destinationId: string | null): Destination | undefined {
  if (!destinationId) return undefined;
  return destinations.find((destination) => destination.id === destinationId);
}

/** The events Home leads with — the modelled scenario first. */
export function getSuggestedDestinations(): Destination[] {
  return destinations.filter((destination) => destination.suggested);
}

/**
 * Events currently drawing rising interest, in a fixed order. The reason
 * travels with the data and is shown in the UI, so "trending" is never an
 * unexplained badge — there is no popularity feed behind this prototype.
 */
export function getTrendingDestinations(): Destination[] {
  return destinations
    .filter((destination) => destination.trending)
    .sort((a, b) => (a.trending?.rank ?? 0) - (b.trending?.rank ?? 0));
}
