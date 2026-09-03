# 03 — Visitor Experience

## 1. Experience goal

The visitor should feel that the product is a smart event companion.

It should be useful both:

- before the trip,
- during travel,
- while inside the event.

## 2. Mobile-first requirement

The visitor interface must be designed primarily for smartphones.

The visitor may be:

- walking,
- standing in a station,
- carrying luggage,
- in a crowded environment,
- looking at the phone briefly.

Therefore:

- large touch targets,
- short text,
- strong hierarchy,
- one clear next action,
- minimal dense charts,
- map when spatial context matters,
- recommendations written in plain language.

## 3. Screen flow

```text
Visitor Home
    ↓
Plan My Visit
    ↓
Accommodation Intelligence
    ↓
Recommended Stay
    ↓
Journey Planner
    ↓
Live Journey
    ↓
Dynamic Re-optimization
    ↓
Updated Journey
```

## 4. Visitor Home

Purpose:

Create immediate context.

Show:

- event
- date
- current destination status
- plan entry point
- upcoming trip
- compact live conditions

Primary CTA:

**Plan My Visit**

Do not turn the home screen into an analytics dashboard.

## 5. Accommodation Intelligence

Purpose:

Help the visitor choose where to stay based on the whole ecosystem.

Each option should communicate:

- price
- availability
- distance
- travel time
- transport
- crowd pressure
- recommendation reason

Example:

### North Zone — Recommended

₹1,450/night

540 rooms available

18 min to venue

Direct shuttle

Moderate crowd

Reason:

> Best balance of availability, cost, travel time, and congestion.

## 6. Recommended Stay

The visitor should understand why the recommendation exists.

Use:

> **Why we recommend this**

Then explain:

- Central is approaching saturation.
- North has more available accommodation.
- Direct transport has spare capacity.
- Predicted crowd pressure is lower.

The visitor can still compare alternatives.

## 7. Journey Planner

Once the stay is selected, generate the complete journey.

Example:

```text
Hotel
 ↓
Walk 5 min
 ↓
North Transit Hub
 ↓
Shuttle S3 — 12 min
 ↓
Gate B
 ↓
Venue
```

Show:

- arrival time
- total travel duration
- cost
- congestion
- reliability

## 8. Live Journey

The screen should answer:

> What do I need to do right now?

Show:

- current journey step
- next action
- route
- live crowd
- transport state
- venue status

Avoid overwhelming the visitor with raw analytics.

## 9. Dynamic Re-optimization

This is a hero interaction.

Example:

> **Your plan can be improved**

> Crowd levels near Gate A are increasing faster than expected.

Recommended:

> Use Gate B.

Expected effect:

> Save approximately 11 minutes and avoid higher crowd pressure.

Actions:

- Update My Route
- Keep Current Plan

## 10. Visitor alerts

Alerts should be calm and actionable.

Good:

> **Heads up**
>
> Gate A is becoming busy.
> Gate B currently has shorter waits.
>
> Estimated time saved: 11 min.

Avoid unnecessary alarm language.

## 11. Visitor recommendation philosophy

Recommendations should expose trade-offs.

Example:

> ₹350 cheaper · +8 min travel · significantly lower congestion

The visitor should remain in control.

## 12. Future capabilities

Potential future features:

- actual hotel booking
- transport booking
- digital ticket integration
- incentives
- accessibility preferences
- multilingual support
- family/group planning
- live navigation

Do not implement these unless they directly support the demo.
