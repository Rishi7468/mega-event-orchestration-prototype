# Pravaah

## Destination intelligence for mega-events

Pravaah is a mega-event hospitality orchestration platform that connects
visitor planning with organiser-side capacity and crowd intelligence. A
visitor uses it to decide when to attend, where to stay, how to get there, and
what to do when conditions change mid-trip. An organiser uses the same
underlying state to see demand build across a destination, forecast where
pressure is heading, and approve a constrained intervention before it becomes
an incident.

**Visitor experience** — plan event attendance, timing, accommodation and
journey, then adapt the plan live as conditions change.

**Organiser experience** — monitor demand, read crowd pressure, watch
transport and venue conditions, forecast where pressure is heading, receive a
recommendation, approve an intervention, and see the outcome.

Both experiences read and write one shared simulation state, so a change a
visitor accepts and a response an organiser approves are two views of the
same event, not two disconnected demos.

---

## Problem

A mega-event doesn't fail because too few people show up — it strains because
demand across accommodation, transport, venue capacity, gates and approach
corridors builds unevenly and faster than a person managing it by hand can
track. A gate that was fine at 9 AM can be the wrong gate by 9:30. A zone with
plenty of rooms can sit half empty while the zone next to it saturates.

The problem is not attracting people to an event. It's coordinating **where**
and **when** people move so the destination stays manageable while every
individual visitor still gets a plan that works for them.

## Solution

Pravaah runs one loop, in both directions:

```text
Sense → Predict → Decide → Act → Outcome
```

```text
 Camera observations      Visitor intent
  (density, flow)       (event, origin, time)
        │                        │
        ▼                        ▼
   Zone / gate / transport pressure  ◄── operational state
        │
        ▼
   Short-horizon forecast  ("if nothing changes, +20% in 20 min")
        │
        ▼
   Recommendation   (visitor: a better gate/route · organiser: an intervention)
        │
        ▼
   Decision   (visitor accepts · organiser approves — a human decides, always)
        │
        ▼
   Outcome   (measured before → after, shown on both surfaces)
```

A visitor accepting a re-route and an organiser approving a redistribution
are the same underlying state transition, read from two different screens.
Neither surface can show a number the other would contradict — there is one
simulation, not two.

---

## Key Features

### Visitor

- Event-first intent — "which event am I attending", never generic place
  discovery
- Visit-timing recommendation — best day and arrival window, with the reasons
  behind it
- "Visit now" as a first-class path alongside planning ahead
- Origin-aware journey planning — the inbound leg and the local journey are
  planned together, not just the local leg
- Accommodation recommendation weighted on availability, price, transport,
  crowd pressure and travel time, with simulated reviews as a minor factor
- Transport/journey recommendation, including live route load
- Live event conditions and step-by-step journey guidance
- Adaptive gate recommendation when a faster or calmer gate opens up mid-trip

### Organiser

- Command center — destination state, forecast, recommendation, action and
  outcome on one screen
- Demand & capacity intelligence across every zone
- Crowd intelligence — filterable, selectable site-camera feeds
- Local MP4 camera playback with an operational overlay (people, density,
  flow, trend, status)
- Geographic operational map (Leaflet/OpenStreetMap) with toggleable layers —
  zones, venue & gates, transport corridors, cameras
- Transport utilization and venue/gate pressure, read live
- Short-horizon forecasts per zone
- Constraint-aware recommendations — an intervention is only offered when the
  underlying capacity actually supports it
- Human-approved interventions — nothing dispatches automatically
- Outcome tracking — before/after, on the same screen as the decision

---

## How the Demo Works

The prototype runs one deterministic scenario end to end:

1. Visitor selects an event and an origin
2. Pravaah recommends where to stay and builds a full journey to the venue
3. A demand spike is simulated (one button, one deterministic scenario)
4. Crowd pressure and transport load rise in the affected zone
5. Pravaah forecasts where that pressure is heading
6. A calmer gate/route is recommended to the visitor
7. The visitor accepts the adaptation
8. The organiser's command center reflects the same change, live, in another
   tab — no refresh
9. The organiser approves a redistribution intervention
10. Conditions ease and redistribute toward the spare zone
11. The visitor sees the stabilised state reflected in their own journey

Every figure in that sequence is table-driven and repeats identically on every
run — this is a scripted demonstration of the orchestration loop, not a live
production system.

---

## System Architecture

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand ·
Leaflet + OpenStreetMap · local MP4 media

```text
Data / Observations   (destinations, zones, transport, gates, cameras — deterministic tables)
        │
        ▼
Operational State     (per-phase snapshots: normal → demand-spike → prediction → …)
        │
        ▼
Prediction            (short-horizon zone-pressure forecast)
        │
        ▼
Recommendation        (accommodation / route / gate / operator intervention)
        │
        ▼
Intervention          (organiser approval — human in the loop)
        │
        ▼
Outcome               (measured before/after, shown to both surfaces)
```

Two Zustand stores split the state on purpose:

- **Simulation store** — the destination's shared condition (`phase`, zone
  snapshots). Persisted to `localStorage` and synced across browser tabs, so
  a visitor tab and an operator tab watch the same destination.
- **Visitor store** — one visitor's own decisions (which event, which zone,
  which gate, how far into the journey). Deliberately *not* persisted or
  shared — it's per-tab, the way one visitor's choices should be.

Everything else — the recommendation engine, the journey builder, the
condition resolvers — is pure functions over that state, kept out of the UI
layer so a page never computes its own version of a number another page also
shows.

---

## Data & Simulation

The prototype uses **deterministic simulated operational data**, not a live
production feed. To be specific about what that means:

- Visitor demand, zone pressure, gate queues and transport utilization are
  table-driven per simulation phase (`normal → demand-spike → prediction →
  recommendation → accepted → response → outcome`) — not randomised, not
  time-based, and identical on every run.
- Camera observations (people detected, density, flow, trend, status) are
  simulated readings authored to move consistently with the zone pressure
  they represent.
- There is no live CCTV integration, no real-time computer vision, no drone
  or aerial feed, and no production ML forecasting model. The camera type
  model stays source-agnostic so a future aerial/CCTV integration wouldn't
  require reshaping it, but the current prototype intentionally exposes only
  site-camera footage — there is no drone or aerial functionality anywhere in
  the current UI.
- Every camera feed is labelled **"Simulated camera feed"** unless a real,
  properly licensed clip has been registered for it (see below) — and even
  registered demo footage remains reference footage, not a live feed.

Data is centralized under `src/data/` specifically so it stays auditable —
every number a screen shows can be traced back to one table.

---

## Maps & Operational Geography

The operational map is a real **Leaflet + OpenStreetMap** map, not an
abstract diagram — zones, the venue, gates and transport corridors are drawn
as real geographic overlays on top of actual street and river geometry.

The **primary demo scenario** (Maha Kumbh, Prayagraj) has full operational
geography modelled: zone boundaries, gate positions, camera positions and
transport corridor alignments, all anchored to real coordinates. Other events
in the catalogue render the same real base map for their host city but
without that level of operational overlay — the prototype is honest that only
one scenario carries the full model, rather than inventing zone boundaries
for events it hasn't modelled.

Map tiles default to the OpenStreetMap standard style (no API key required)
and the integration degrades gracefully — operational overlays still render
even if the tile service is unreachable.

---

## Camera Intelligence

The camera system supports:

- Multiple camera observations per destination, filterable by zone or by
  "needs attention"
- Camera selection into a large primary feed, with every other feed shown
  alongside it
- Local MP4 playback (play/pause, mute, fullscreen) through one reusable
  media component
- An operational overlay on the feed: people detected, density, flow, trend
  and status
- A media registry that decouples footage from camera identity — a page
  never hardcodes a video path
- Graceful fallback: a camera with no registered clip, or a clip that fails
  to load, renders a labelled **"Simulated camera feed"** panel instead of a
  broken player, and every analytic reading keeps working regardless

**The prototype's camera feeds are simulated reference footage and do not
represent live CCTV.** Where a clip visibly shows a dense crowd or a
detection overlay baked into the source video, that is part of the supplied
footage — it is not evidence that Pravaah is running computer vision on the
stream.

---

## Running Locally

```bash
npm install
npm run dev
```

Then, before committing or shipping a change:

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Deployment

The project deploys to [Vercel](https://vercel.com) with no configuration. It
is a static-first Next.js App Router app — every route is prerendered except
`/visitor/plan/stay/[id]`, which renders per request. There is no database, no
API route, no server-side session, and nothing is written to disk at
runtime; all state lives in the browser (Zustand, plus `localStorage` for
cross-tab demo sync).

**Live demo:** [Live Demo](YOUR_VERCEL_URL)

### Environment variables

All optional — see `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MAP_TILE_URL` | Alternative OpenStreetMap-compatible tile URL. Defaults to the OSM standard style, which needs no key. |
| `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` | Attribution HTML for that provider. |

Only the map component reads them, and the map still renders its operational
overlays over a plain background if the tile service is unreachable.

---

## Project Structure

```text
src/
  app/
    page.tsx                  Entry screen — the Pravaah introduction + the two experiences
    layout.tsx                Root layout, fonts, metadata
    visitor/                  Visitor experience (mobile-first)
      page.tsx                Home
      destination/            Event, origin, timing intent
      plan/                   Accommodation recommendation + stay detail
      plan/journey/           Journey planner
      live/                   Live journey + re-optimization
      profile/                Trip summary, demo reset, tour replay
    operator/                 Organiser experience (desktop-first)
      page.tsx                Command Center
      demand/                 Demand & Capacity
      crowd/                  Crowd Intelligence (cameras)
      interventions/          Interventions

  components/
    visitor/                  Visitor-only UI (DeviceFrame, journey timeline, cards…)
    operator/                 Operator-only UI (sidebar, panels, lineage pipeline…)
    map/                      GeoMap (Leaflet) and its per-surface wrappers
    camera/                   CameraFeed (media playback + overlay), CameraFeedCard
    shared/                   Cross-surface UI (Button, Card, BrandMark…)

  data/                       Deterministic tables — destinations, zones, transport,
                               venues, cameras, properties, geography, media registry
  lib/
    recommendation/           Pure scoring functions (accommodation, route, gate, timing…)
    journey/                  buildJourney — the single source of a visitor's itinerary
    conditions.ts             Phase → live-data resolvers
    operator/                 Operator-facing derived summaries
  store/                      Zustand stores (simulation, visitor) + cross-tab sync
  types/                      Shared TypeScript types

public/media/cameras/         Local camera footage (see its own README)
docs/                         Product/design specification the prototype was built from
```

---

## Design Principles

- Event-first, not generic tourism discovery
- Operations over dashboards — every screen answers "what do I do", not just
  "what is the number"
- A recommendation must be actionable and explain itself
- Decisions respect capacity constraints — an intervention is only offered
  when there's genuinely spare capacity to use
- Visitor and organiser states stay connected — one simulation, two views
- Simulated data is labelled as simulated, everywhere it appears
- Mobile-first visitor experience, desktop-first operator experience, one
  shared design-token system underneath both

---

## Limitations / Future Scope

This is a prototype, and its boundaries are deliberate rather than
accidental:

- The simulation is a deterministic, table-driven scenario rather than a
  production forecasting model — it demonstrates the orchestration loop, not
  a trained predictor.
- Camera footage is simulated reference footage; there is no live CCTV or
  computer-vision pipeline behind it.
- Full operational geography (zones, gates, corridors) is modelled for the
  primary demo scenario only; other catalogue events share the same real
  base map without that overlay.
- Intervention "initiated" state is local UI state and isn't itself
  persisted as part of the shared simulation.
- There are no live external feeds (transport APIs, booking systems, GPS) —
  by design, to keep the demo self-contained and repeatable.

None of these are gaps in the idea — they're the parts a production
deployment would connect to real partner data (live camera feeds, transport
operators, booking inventory) without changing the architecture described
above.

---

## Hackathon Context

Built for **HackCelestial 3.0**, addressing **PS-8 — Mega-Event Hospitality
Orchestration: Intelligent Capacity & Crowd Management**.

Pravaah responds to that problem statement directly: it treats a mega-event
as one destination-scale system rather than a set of independent bookings,
and gives both the visitor and the organiser a shared, live view of capacity
and crowd pressure so decisions on either side account for the other.
