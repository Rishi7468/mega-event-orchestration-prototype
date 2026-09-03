# 07 — Recommendation Logic

## Purpose

This document explains how the prototype should produce believable recommendations.

The implementation can be deterministic.

The UI should make the output feel intelligent because it uses multiple contextual signals and provides explanations.

## 1. Accommodation recommendation

### Inputs

- price
- availability
- distance
- travel time
- transport quality
- crowd pressure
- visitor budget

### Conceptual score

```text
score =
  availability benefit
+ affordability benefit
+ transport benefit
+ low-crowd benefit
+ travel-time benefit
+ preference fit
```

Weights can be simple and tuned for the demo.

## 2. Important rule

Do not always choose the numerically nearest hotel.

If Central is overloaded, a slightly farther North property should win when its combined value is better.

## 3. Recommendation explanation

Every recommendation should provide reasons.

Example:

> **North Zone recommended**
>
> More rooms are available, the direct shuttle currently has spare capacity, and projected crowd pressure is lower than Central.

## 4. Route recommendation

Inputs:

- route travel time
- congestion
- transport utilization
- transfers
- reliability
- visitor location

Conceptual score:

```text
route utility =
  shorter time
+ lower congestion
+ better reliability
- transfer friction
```

## 5. Timing recommendation

Consider:

- venue demand forecast
- crowd forecast
- transport forecast
- visitor preferred time

Example:

> Arrive between 9:20–9:40 AM.

Reason:

> Crowd pressure is expected to rise after 10 AM.

## 6. Venue entrance recommendation

Consider:

- gate occupancy
- estimated queue
- distance from visitor
- route accessibility

Example:

> Gate B is recommended.

Reason:

> Gate A is projected to become congested.

## 7. Operator recommendation

Consider:

- pressure by zone
- spare capacity
- transport capacity
- visitor demand
- predicted future state

Example:

> Redirect 1,200 expected arrivals from Central to North.

## 8. Confidence

Use simple confidence levels:

- High
- Medium
- Low

Do not create false precision.

Avoid:

`97.38462% confidence`

Prefer:

> High confidence

or:

> Moderate confidence — conditions are changing quickly.

## 9. Explainability template

Every recommendation can follow:

```text
WHAT:
What should the user do?

WHY:
What signals caused the recommendation?

IMPACT:
What improvement is expected?

ALTERNATIVE:
What happens if they keep the current plan?
```

## 10. Visitor language vs operator language

Visitor:

> "Gate B is 11 minutes faster."

Operator:

> "Shift arrivals from Gate A to Gate B to reduce projected peak pressure."

The same intelligence is translated for the audience.

## 11. Simulation-friendly logic

The implementation should use functions such as:

```ts
getAccommodationRecommendation()
getRouteRecommendation()
getTimingRecommendation()
getGateRecommendation()
predictZonePressure()
getOperatorRecommendation()
```

Keep these functions separate from UI components.

## 12. Important prototype rule

The recommendation engine does not need to be academically optimal.

It needs to be:

- consistent,
- explainable,
- responsive to state changes,
- believable,
- easy to demonstrate.
