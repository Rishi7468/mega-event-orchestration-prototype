# MEGA EVENT ORCHESTRATOR — BUILD ORDER

## RULE
Do not rebuild existing working features.
Prefer open-source implementations, existing libraries, and minimal integration/tweaks.
After every stage:
1. Run the app.
2. Test the feature.
3. Fix regressions.
4. Stop.
5. Wait for manual review before proceeding.

---

## PHASE 1 — LIVE CROWD INTELLIGENCE [HIGHEST PRIORITY]

Goal:
Turn the existing person-counting/CV pipeline into meaningful live zone state.

Build:
- person detection
- tracking where already available / easiest to integrate
- map detections to existing authored zones
- zone occupancy
- density/crowd pressure
- trend ↑ ↓ →
- confidence
- timestamp / freshness

Output per zone:

peopleCount
occupancy
crowdLevel
trend
confidence
lastUpdated

DO NOT build prediction or routing yet.

Acceptance:
A real/simulated video feed changes a zone's state and the operator UI reflects it.

---

## PHASE 2 — CROWD FLOW GRAPH

Goal:
Understand movement between zones, not just people count.

Build:
- anonymous tracking
- movement vectors
- zone-to-zone transitions
- incoming flow
- outgoing flow
- net accumulation
- dominant direction

Output:

Zone A → Zone B: X people/min
Zone B → Zone C: Y people/min

Visualize this on the existing event map.

Acceptance:
A moving crowd produces visibly changing flow information.

---

## PHASE 3 — PREDICTIVE CROWD STATE

Goal:
Predict congestion before it happens.

Use simple deterministic math first.

incomingFlow - outgoingFlow = net accumulation

remainingCapacity / netAccumulation = estimated time to threshold

Build:
- predicted congestion
- estimated time-to-critical
- confidence
- warning states
- recommended operator action

Example:

"Zone B likely to reach critical density in ~5 min."

DO NOT introduce unnecessary ML.

Acceptance:
Changing flow causes the predicted warning to change correctly.

---

## PHASE 4 — EVENT-AWARE ROUTING

Goal:
Make navigation crowd-aware rather than distance-only.

Reuse existing routing/open-source routing where possible.

Base route:
distance + travel time

Add event penalties:
- crowd pressure
- congestion
- incidents
- queues
- restricted zones
- accessibility
- transport availability

Create a simple weighted route score.

Acceptance:
Two possible routes can produce different recommendations when crowd conditions change.

---

## PHASE 5 — DYNAMIC REROUTING

Goal:
Make the system feel alive.

Flow:

User starts route
→ crowd state changes
→ route becomes undesirable
→ system detects change
→ alternative route calculated
→ user receives explanation

Example:

"Route updated because crowd pressure near Gate A is rising."

Acceptance:
The same journey can automatically change when a zone becomes congested.

---

## PHASE 6 — JOURNEY / ITINERARY OPTIMIZER

Goal:
Optimize the entire event experience, not just one route.

Inputs:
- available time
- starting point
- desired landmarks
- user priorities
- crowd conditions
- travel time
- waiting time
- landmark importance
- accessibility

Output:

Start
→ Landmark A
→ Landmark B
→ Landmark C
→ Exit

The sequence must react to live crowd conditions.

Acceptance:
Changing crowd conditions can reorder the user's planned destinations.

---

## PHASE 7 — OPERATOR INTELLIGENCE

Goal:
Turn crowd intelligence into actionable interventions.

Examples:

"Redirect visitors from Gate B to Gate C."

"Open alternate corridor."

"Zone C predicted critical in 4 minutes."

Show:
- current situation
- predicted situation
- recommended action
- expected impact

Acceptance:
Operator can understand what is happening and what the system recommends within seconds.

---

## PHASE 8 — DATA SOURCE FUSION

Goal:
Support multiple sources without changing the intelligence layer.

Sources:
- CCTV/video
- uploaded video
- public livestream
- operator/manual input
- simulated data

Normalize all sources into the same:

CrowdObservation
→ ZoneState
→ FlowState

For public livestreams:
sample frames periodically rather than attempting unnecessary continuous processing.

Show source + confidence.

Acceptance:
Different input sources produce the same downstream event intelligence model.

---

## PHASE 9 — DIGITAL TWIN / 3D MAP ENHANCEMENT

ONLY AFTER THE INTELLIGENCE WORKS.

Improve existing map using open-source components such as MapLibre.

Add:
- crowd heat
- flow arrows
- incidents
- cameras
- gates
- landmarks
- routes
- zone state
- 3D/tilted visualization if useful

Do not turn the map into a visual gimmick.

---

## PHASE 10 — UX / DEMO POLISH

Last.

Improve:
- hierarchy
- animations
- loading states
- explanations
- mobile responsiveness
- visual consistency
- transitions
- empty/error states

Do not redesign working screens unless necessary.

---

# FINAL DEMO FLOW

1. Operator opens event.
2. Live/simulated video is running.
3. Crowd state changes.
4. Flow appears between zones.
5. System predicts congestion.
6. User requests a journey.
7. System generates an event-aware route/itinerary.
8. Crowd conditions change.
9. Route/itinerary automatically updates.
10. Operator receives recommended intervention.
11. UI explains WHY the recommendation changed.

Core story:

PLAN → OBSERVE → DETECT → UNDERSTAND → PREDICT → OPTIMIZE → REROUTE → INTERVENE

---

# PRIORITY

P0:
- Live crowd state
- Flow
- Prediction
- Event-aware routing
- Dynamic rerouting

P1:
- Journey optimizer
- Operator recommendations
- Multi-source inputs

P2:
- 3D/digital twin enhancements
- visual polish
- animations
- secondary UX improvements

P3:
- advanced simulation
- complex ML prediction
- nonessential integrations

Never sacrifice P0 for P2/P3.