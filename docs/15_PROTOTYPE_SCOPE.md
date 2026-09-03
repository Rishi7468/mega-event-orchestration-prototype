# 15 — Prototype Scope

## Objective

Build a convincing proof of intelligent hospitality orchestration.

Do not build a production system.

## Tier 1 — Must build

### Visitor

- mobile-first home
- event planning
- accommodation intelligence
- recommended stay
- journey planner
- live journey
- dynamic re-optimization
- visitor alert
- accept recommendation

### Shared intelligence

- capacity state
- accommodation state
- transport state
- crowd state
- venue state
- prediction
- recommendation
- explainability
- simulation

### Operator

- command center
- destination map
- capacity distribution
- crowd intelligence
- camera feed
- alerts
- recommendation
- approve intervention
- outcome

## Tier 2 — Strong additions

- weather context
- traffic congestion
- medical incident
- additional camera
- demand forecast chart
- incentive concept
- historical outcome

## Tier 3 — Future

- real booking
- ticketing
- payments
- live APIs
- real drone feeds
- computer vision service
- real-time transport integrations
- government systems
- production optimization

## What not to overbuild

Avoid spending time on:

- login
- account management
- admin settings
- database design
- complex backend
- real reservation transactions
- production security architecture

## Prototype balance

Recommended effort:

```text
Visitor experience          40%
Shared intelligence         25%
Operator experience         20%
Simulation                  10%
Polish                       5%
```

The exact split can change, but the visitor should remain the strongest visible experience.

## MVP if time is extremely limited

Build:

1. Visitor Home
2. Accommodation recommendation
3. Journey
4. Live crowd alert
5. Demand spike simulation
6. Re-optimization
7. Operator map
8. Operator recommendation
9. Outcome

## Definition of done

The prototype is successful when a reviewer can understand the following without a verbal explanation:

> A visitor has a goal.

> The destination has uneven capacity.

> The system sees the broader situation.

> It recommends a better plan.

> Conditions change.

> The system predicts the impact.

> The visitor adapts.

> Operators see the larger demand movement.

> The system measures the result.

## Scope decision rule

For every new feature, ask:

> Does this make the visitor's event experience better or demonstrate how the platform balances destination capacity?

If neither, defer it.

## Final product principle

**Build a smaller system that feels alive rather than a larger system that feels unfinished.**
