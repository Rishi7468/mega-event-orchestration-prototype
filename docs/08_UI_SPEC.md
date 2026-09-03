# 08 — UI Specification

## 1. Product UI architecture

Create two primary experiences:

```text
/visitor
/operator
```

A simple event-selection/entry screen can exist before them.

## 2. Visitor UI

### Design target

Mobile-first.

The visitor should be able to use the interface with one hand and understand the next action quickly.

### Navigation

Suggested:

- Home
- Plan
- Live
- Profile

Do not add many navigation items.

## 3. Visitor Home

Show:

- event greeting
- event status
- upcoming plan
- destination snapshot
- primary "Plan My Visit"

The screen should feel like a travel companion.

## 4. Accommodation screen

Top:

- destination map

Below:

- zone recommendations

Cards should show:

- availability
- price
- travel time
- crowd
- transport
- reason

## 5. Recommended Stay

Show:

- selected property/zone
- price
- availability
- travel time
- transport
- crowd
- why recommended

Primary action:

`Choose this stay`

## 6. Journey Planner

Show a vertical journey timeline.

Example:

```text
Hotel
 ↓
Walk
 ↓
Transit Hub
 ↓
Shuttle
 ↓
Gate B
 ↓
Venue
```

Use large, readable time and duration values.

## 7. Live Journey

Prioritize:

1. next action
2. route
3. current status
4. relevant alert

Do not prioritize charts.

## 8. Re-optimization state

This should be visually prominent.

Example:

> **Your plan can be improved**

Then:

Current:

`Gate A · 18 min expected wait`

Recommended:

`Gate B · 7 min expected wait`

CTA:

`Update My Route`

Secondary:

`Keep Current Plan`

## 9. Live Event Card

This is a compact contextual mobile state.

Example:

> You're near Central Gate.
>
> Gate A wait: 18 min
>
> Gate B wait: 7 min
>
> 6 min walk to Gate B
>
> **Navigate to Gate B**

## 10. Operator desktop

### Structure

```text
HEADER
KPI STRIP
------------------------------------------------
DESTINATION MAP       | INTELLIGENCE PANEL
                      | Alerts
                      | Predictions
                      | Recommendations
------------------------------------------------
CAMERA FEEDS | CAPACITY | TRANSPORT | INCIDENTS
```

## 11. Operator map

Show:

- zones
- gates
- routes
- accommodation areas
- cameras
- crowd pressure
- transport

## 12. Operator intelligence panel

Use sections:

- Live Alerts
- Forecasts
- Recommended Actions

## 13. Operator recommendation

Show:

- issue
- prediction
- recommended intervention
- expected impact
- affected zones
- confidence

Buttons:

`Approve Response`

`Modify`

## 14. Outcome panel

Show:

- before
- action
- after

Example:

```text
Central pressure     91% → 72%
North pressure       48% → 59%
Transport utilization 86% → 68%
Visitor travel       42m → 31m
```

## 15. Camera component

Example:

```text
CAM-07 · Main Corridor
Source: Site Camera

People: 8,734
Density: High
Movement: → North
Status: Elevated
```

The camera can be a local video.

## 16. Visual style

Desired:

- dark neutral operator UI
- clean mobile visitor UI
- strong typography
- semantic status colors
- restrained cards
- clear borders
- subtle motion
- operational credibility

Avoid:

- cyberpunk
- excessive neon
- heavy gradients
- decorative AI graphics
- unnecessary 3D
- giant dashboard charts

## 17. Design rule

The visitor sees **decisions**.

The operator sees **evidence + decisions**.

Example:

Visitor:

> "Use Gate B — saves 11 minutes."

Operator:

> "Gate A pressure rising — redirect arrivals to Gate B."
