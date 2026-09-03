# Mega-Event Hospitality Orchestration — Claude Source of Truth

This folder is the complete product and implementation context for the hackathon prototype.

## What we are building

An intelligent event-driven hospitality orchestration platform that helps a visitor plan and adapt their experience during a mega-event while simultaneously helping organizers and hospitality stakeholders balance demand across accommodation, transportation, venues, and visitor movement.

The core promise is:

> **Don't just show visitors what is available. Understand the whole event ecosystem and recommend what they should do next.**

## Product architecture

The product has two experiences powered by one shared intelligence layer:

```text
                    EVENT ECOSYSTEM
                         |
        +----------------+----------------+
        |                |                |
   Accommodation     Transport         Venue
        |                |                |
        +----------------+----------------+
                         |
                  Crowd / CCTV
                         |
                  Event Schedule
                         |
                    Visitor Intent
                         |
                         v
               INTELLIGENCE LAYER
                         |
          +--------------+--------------+
          |                             |
          v                             v
     VISITOR MOBILE              OPERATOR DESKTOP
```

## Prototype priority

The visitor-facing mobile experience is the protagonist.

The operator desktop experience demonstrates that the same intelligence can improve destination-level coordination.

## Important implementation principle

The current prototype may use simulated data and local CCTV video. The system should be architected so that real hotel, transport, venue, CCTV, drone, and other feeds could replace the simulation later.

## Wireframes

The `/wireframes` folder contains nine visual references:

1. Visitor Home
2. Accommodation Intelligence
3. Recommended Stay
4. Journey Planner
5. Live Journey
6. Dynamic Re-optimization
7. Operator Command Center
8. Demand & Capacity Intelligence
9. Live Event Card

These are layout and interaction references. They are not instructions to copy every pixel literally.

## Read these documents before coding

1. `01_PRODUCT_VISION.md`
2. `02_SYSTEM_MENTAL_MODEL.md`
3. `03_VISITOR_EXPERIENCE.md`
4. `04_VISITOR_REAL_WORLD_SCENARIOS.md`
5. `05_OPERATOR_EXPERIENCE.md`
6. `06_ORCHESTRATION_ENGINE.md`
7. `07_RECOMMENDATION_LOGIC.md`
8. `08_UI_SPEC.md`
9. `09_MOBILE_UX_PRINCIPLES.md`
10. `10_WIREFRAME_GUIDE.md`
11. `11_DATA_MODEL.md`
12. `12_SIMULATION_ENGINE.md`
13. `13_DEMO_SCENARIO.md`
14. `14_CLAUDE_BUILD_GUIDE.md`
15. `15_PROTOTYPE_SCOPE.md`

## Definition of success

A judge should be able to understand this story:

**Visitor intent → fragmented event data → intelligent recommendation → changing conditions → re-optimization → better visitor outcome + better destination balance.**

## Running and deploying

```bash
npm install
npm run dev          # development
npm run build        # production build
npm start            # serve the production build
```

The application is a static-first Next.js App Router project: every route is
prerendered except `/visitor/plan/stay/[id]`, which is rendered per request.
There is no database, no API route, no server-side session and nothing is
written to disk at runtime — all state lives in the browser (Zustand, plus
`localStorage` for cross-tab demo sync). It deploys to Vercel with no
configuration and no environment variables.

### Environment variables

All optional — see `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MAP_TILE_URL` | Alternative OpenStreetMap-compatible tile URL. Defaults to the OSM standard style, which needs no key. |
| `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` | Attribution HTML for that provider. |

Only `src/components/map/GeoMap.tsx` reads them. If the tile service is
unreachable the map still draws zones, gates, corridors and cameras over a
plain background rather than disappearing.

### Camera footage

Local video assets go in `public/media/cameras/` and are registered in
`src/data/media.ts`. Nothing hardcodes a video path, and no footage ships with
the prototype: with no clip registered every camera renders a labelled
"Simulated camera feed" panel while all analytics keep working. See
`public/media/cameras/README.md` for the format and sourcing rules.
