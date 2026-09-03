# 05 — Operator Experience

## Purpose

The operator interface is the destination-level view of the same intelligence system.

It is designed for event organizers, hospitality stakeholders, transport coordinators, and city/event operations teams.

## What operators need to know

- Where is demand building?
- Which resource is approaching capacity?
- Where is spare capacity?
- What will happen next?
- What visitor demand can be redistributed?
- Which intervention is likely to work?
- Did it work?

## Main dashboard

### Top

- event status
- active visitors
- accommodation pressure
- transport utilization
- critical zones
- incidents

### Center

Destination map.

Show:

- accommodation zones
- venues
- gates
- transport corridors
- crowd pressure
- camera locations

### Right

Intelligence:

- alerts
- predictions
- recommendations

### Bottom

Visual intelligence:

- CCTV/site-camera feeds
- capacity summaries
- transport state

## Demand distribution

This is one of the most important operator views.

Example:

```text
Central   91% pressure   █████████
North     48% pressure   █████
East      34% pressure   ███
South     40% pressure   ████
```

The operator should immediately understand where demand is concentrated.

## Capacity layers

The system should conceptually track:

- accommodation capacity
- transport capacity
- venue capacity
- pedestrian/crowd capacity

## Operator recommendations

Example:

> **Redistribution opportunity detected**

> Central is approaching capacity while North has spare accommodation and shuttle capacity.

Expected effect:

- Central pressure: -18%
- North pressure: +9%
- transport congestion: -14%

Actions:

`Approve Response`

`Modify`

## Camera intelligence

Use site-camera/CCTV footage in the prototype.

Example:

`CAM-07 · Main Corridor`

Show:

- video
- people estimate
- density
- movement direction
- status

Drone feeds are a future alternative source.

## Operator interventions

Possible prototype actions:

- redirect visitor flow
- change gate recommendation
- increase shuttle frequency
- promote an underused accommodation zone
- flag a route
- deploy a response team

## Human control

AI recommends.

The operator approves.

The prototype must not imply that an AI system autonomously controls real infrastructure.

## Outcome

After an intervention, show:

- before/after pressure
- demand redistribution
- transport change
- visitor impact
- risk change

The operator should see whether the decision achieved its intended result.
