# 11 — Data Model

## Goal

Use deterministic mock data that represents a believable mega-event destination.

The data should support both visitor and operator experiences.

## Event

```ts
type Event = {
  id: string
  name: string
  date: string
  status: 'normal' | 'elevated' | 'critical'
  expectedVisitors: number
  schedule: EventScheduleItem[]
}
```

## Zone

```ts
type Zone = {
  id: string
  name: string
  type: 'accommodation' | 'venue' | 'mixed' | 'transit'
  capacity: number
  currentPopulation: number
  inflowPerMinute: number
  outflowPerMinute: number
  pressurePercent: number
  risk: 'low' | 'medium' | 'high' | 'critical'
}
```

## Accommodation zone

```ts
type AccommodationZone = {
  zoneId: string
  totalRooms: number
  availableRooms: number
  averagePrice: number
  demandTrend: 'rising' | 'stable' | 'falling'
  venueTravelMinutes: number
  transportQuality: 'poor' | 'moderate' | 'good' | 'excellent'
}
```

## Property

```ts
type Property = {
  id: string
  name: string
  zoneId: string
  pricePerNight: number
  availableRooms: number
  rating: number
}
```

## Transport route

```ts
type TransportRoute = {
  id: string
  name: string
  mode: 'bus' | 'shuttle' | 'metro' | 'walk'
  capacityPerHour: number
  currentDemandPerHour: number
  travelMinutes: number
  congestion: 'low' | 'medium' | 'high'
  reliability: number
}
```

## Venue

```ts
type Venue = {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
  gates: VenueGate[]
}
```

## Venue gate

```ts
type VenueGate = {
  id: string
  name: string
  capacityPerMinute: number
  currentQueue: number
  status: 'open' | 'elevated' | 'busy' | 'restricted'
}
```

## Camera

```ts
type Camera = {
  id: string
  name: string
  source: 'site-camera' | 'drone'
  zoneId: string
  videoUrl?: string
  peopleDetected: number
  densityPercent: number
  movementDirection: string
  status: 'normal' | 'elevated' | 'critical'
}
```

## Visitor plan

```ts
type VisitorPlan = {
  id: string
  visitorCount: number
  accommodationId: string
  arrivalTime: string
  routeIds: string[]
  venueGate: string
  estimatedTravelMinutes: number
  estimatedCost: number
  congestionLevel: 'low' | 'medium' | 'high'
}
```

## Recommendation

```ts
type Recommendation = {
  id: string
  audience: 'visitor' | 'operator'
  type: 'accommodation' | 'route' | 'timing' | 'transport' | 'venue' | 'operations'
  title: string
  reason: string[]
  expectedImpact: string
  confidence: 'low' | 'medium' | 'high'
}
```

## Incident

```ts
type Incident = {
  id: string
  type: 'crowd' | 'medical' | 'traffic' | 'security'
  zoneId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'responding' | 'resolved'
  description: string
}
```

## Visitor profile

```ts
type VisitorProfile = {
  partySize: number
  budgetPerNight: number
  stayNights: number
  preferredArrival: string
}
```

## Simulation state

```ts
type SimulationPhase =
  | 'normal'
  | 'demand-spike'
  | 'prediction'
  | 'recommendation'
  | 'accepted'
  | 'response'
  | 'outcome'
```

## Seed destination

Use a fictional mega-event destination.

Suggested zones:

- Central
- North
- East
- South

Infrastructure:

- Main Venue
- Gate A
- Gate B
- Central Transit Hub
- North Transit Hub
- Shuttle S1
- Shuttle S3

## Data consistency

The data must tell one coherent story.

If Central is overloaded:

- hotel availability should be low,
- crowd pressure should be high,
- transport should be under pressure,
- recommendations should favor available alternatives.

If North is recommended:

- North must actually have capacity,
- transport must be plausible,
- travel time must be reasonable.

## Source labels

The UI may label data as:

- simulated live data
- projected
- AI estimate
- site camera
- simulated scenario

Never present fictional values as real-world safety guarantees.
