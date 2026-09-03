# 14 — Claude Build Guide

## Mission

Build a polished frontend prototype from the supplied product documentation and wireframes.

The application should feel like one coherent product, not two unrelated interfaces.

## Required reading

Before making architectural decisions, read every file in `/docs` and inspect the `/wireframes` folder.

## Recommended stack

### Next.js + TypeScript

Use for the application framework.

### Tailwind CSS

Use for styling and responsive behavior.

### shadcn/ui

Use for reusable UI primitives.

### Lucide React

Use for icons.

### Recharts

Use for decision-support charts.

### Leaflet + OpenStreetMap

Use for the destination map.

If Leaflet becomes unnecessarily complex for a static prototype, a custom SVG map is acceptable.

### Zustand

Use for shared simulation and visitor/operator state.

### Framer Motion

Use selectively for:

- recommendation transitions
- alert appearance
- metric changes
- response confirmation

### HTML5 video

Use local video assets for CCTV/site-camera feeds.

## Why this stack

The objective is fast, polished prototype development.

Avoid infrastructure that does not contribute directly to the demo.

## Suggested architecture

```text
src/
  app/
    visitor/
    operator/
  components/
    shared/
    visitor/
    operator/
    map/
    camera/
    charts/
  data/
  lib/
    recommendation/
    simulation/
  store/
  types/
public/
  feeds/
  images/
```

## State architecture

Create a shared event/simulation store.

It should expose state such as:

```ts
simulationPhase
zones
accommodation
transport
venue
visitorPlan
recommendations
alerts
```

The visitor and operator routes should consume the same state.

## Implementation order

### Phase 1

Create application shell.

### Phase 2

Implement visitor experience.

Start with:

1. Home
2. Accommodation
3. Recommended Stay
4. Journey
5. Live
6. Re-optimization

### Phase 3

Implement shared recommendation logic.

### Phase 4

Implement simulation.

### Phase 5

Implement operator dashboard.

### Phase 6

Connect visitor and operator to the same simulation state.

### Phase 7

Polish.

## Important architecture rule

Do not build two independent fake data systems.

The visitor and operator must react to the same destination state.

## AI implementation

Use deterministic functions initially.

Example:

```ts
getAccommodationRecommendation()
getRouteRecommendation()
getTimingRecommendation()
getGateRecommendation()
predictZonePressure()
getOperatorRecommendation()
```

These can be rule/score based.

## Video

Use local assets.

If the actual camera footage is not available, provide a graceful fallback.

Do not block the app because a video file is missing.

## Map

The map should communicate the event ecosystem, not attempt to become a full GIS product.

Show:

- zones
- hotels
- venue
- gates
- transit hubs
- routes
- cameras

## Visual implementation

### Visitor

Premium but practical travel utility.

### Operator

Dark operational command center.

The two interfaces can share typography and design tokens while having different information density.

## Error handling

The demo must not expose raw errors.

Provide graceful states for:

- missing video
- unavailable route
- no recommendation
- simulation reset

## Do not add

Unless explicitly requested:

- authentication
- database
- payments
- production backend
- real booking
- real government integrations
- complex AI infrastructure
- real-time WebSocket infrastructure

## Code quality

- use TypeScript types
- avoid giant components
- keep logic separate from presentation
- use reusable components
- avoid duplicated constants
- use meaningful names
- keep mock data centralized

## Demo quality

The final build should be optimized for a screen recording.

Important interactions should be deterministic and visually obvious.

## Final acceptance test

A clean run must allow:

1. visitor creates plan,
2. accommodation recommendation appears,
3. journey appears,
4. demand spike starts,
5. prediction appears,
6. visitor recommendation updates,
7. visitor accepts,
8. operator sees changed destination state,
9. operator approves intervention,
10. outcome metrics improve.
