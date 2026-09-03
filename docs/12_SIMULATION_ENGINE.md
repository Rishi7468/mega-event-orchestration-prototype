# 12 — Simulation Engine

## Purpose

The simulation creates a repeatable event scenario without requiring real APIs.

It should demonstrate that the platform responds to changing conditions.

## Core rule

Do not use uncontrolled randomness.

The demo must behave consistently every time.

## State machine

```text
NORMAL
  ↓
DEMAND SPIKE
  ↓
PREDICTION
  ↓
RECOMMENDATION
  ↓
VISITOR ACCEPTS / OPERATOR APPROVES
  ↓
RESPONSE
  ↓
OUTCOME
```

## Phase 1 — Normal

Example:

Central:

- accommodation pressure: 72%
- crowd pressure: 62%
- transport utilization: 70%

North:

- accommodation pressure: 48%
- crowd pressure: 42%
- transport utilization: 52%

East:

- accommodation pressure: 34%
- crowd pressure: 31%
- transport utilization: 45%

## Phase 2 — Demand spike

Trigger:

`Simulate Demand Spike`

Effects:

- expected arrivals increase
- Central accommodation demand rises
- Central crowd rises
- Gate A pressure rises
- main transport utilization rises

## Phase 3 — Prediction

System produces:

> Central Zone is projected to experience critical pressure.

and:

> Gate A is projected to become significantly congested.

## Phase 4 — Visitor recommendation

Visitor sees:

> Your plan can be improved.

Recommendation:

- earlier arrival
- alternate route
- Gate B

## Phase 5 — Operator recommendation

Operator sees:

> Redistribute arrival demand toward North / Gate B.

## Phase 6 — Action

Visitor:

`Update My Route`

Operator:

`Approve Response`

## Phase 7 — Response

Simulate:

- lower Central inflow
- higher North inflow
- lower Gate A pressure
- improved transport utilization
- visitor travel time reduction

## Phase 8 — Outcome

Suggested demonstration:

```text
Central pressure       91% → 72%
North pressure         48% → 59%
Main route utilization 86% → 68%
Visitor travel time    42m → 31m
```

## Camera simulation

Primary source:

**Site camera/CCTV**

The camera UI should show local video or a looped clip.

Analytics can be simulated:

- people detected
- density
- movement
- risk

Do not make the demo dependent on a live internet video stream.

## Drone strategy

Drone is a future source.

Represent it in the data model:

`source: 'drone'`

but do not make it a requirement.

If real ThinkAerial footage becomes available, it can be substituted into the same camera component.

## Simulation synchronization

When state changes:

### Visitor

Update:

- route
- timing
- congestion
- alerts
- recommendation

### Operator

Update:

- map
- zone pressure
- demand distribution
- alerts
- intervention status

This synchronization is critical.

## Reset

Always provide a way to reset the scenario.

The demo should start from the same clean state.
