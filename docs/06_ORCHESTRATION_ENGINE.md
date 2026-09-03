# 06 — Orchestration Engine

## Purpose

The orchestration engine is the conceptual core of the product.

It connects resources that are usually managed independently.

## Inputs

### Accommodation

- total rooms
- available rooms
- price
- zone
- demand trend

### Transport

- route
- mode
- capacity
- current utilization
- travel time
- congestion
- frequency

### Venue

- total capacity
- current occupancy
- gate capacity
- event schedule

### Crowd

- zone population
- density
- inflow
- outflow
- direction
- camera observations

### Visitor

- party size
- budget
- stay duration
- preferred arrival
- selected accommodation
- current route

### Event

- schedule
- expected attendance
- changes
- venue

### Context

- weather
- incidents
- road conditions

## Derived state

The engine should calculate or simulate:

### Accommodation pressure

`occupied / total capacity`

### Transport utilization

`demand / available capacity`

### Venue pressure

`current occupancy / venue capacity`

### Crowd pressure

`current population / zone operating capacity`

### Demand growth

`change in demand over time`

### Risk

A conceptual combined score can use:

- capacity pressure
- growth rate
- transport pressure
- venue demand
- incident severity

## Visitor optimization

The recommendation should consider:

```text
price
+
availability
+
travel time
+
transport reliability
+
crowd pressure
+
visitor preference
```

## Destination optimization

The system also considers:

```text
current resource pressure
+
spare capacity
+
predicted demand
+
transport availability
```

## Multi-objective recommendation

A visitor's best choice is not necessarily:

- nearest,
- cheapest,
- fastest.

The product should demonstrate a more useful combined recommendation.

Example:

North may be 10 minutes farther but:

- cheaper,
- more available,
- less crowded,
- connected by a reliable shuttle.

Therefore North can become the best overall option.

## Dynamic re-optimization

A plan is not permanent.

```text
Visitor plan
    ↓
New live signal
    ↓
Recalculate destination state
    ↓
Predict impact on current plan
    ↓
Evaluate alternatives
    ↓
Recommend change
```

## Visitor/operator coupling

A recommendation can affect both levels.

Example:

Visitor:

> Use Gate B.

Destination:

> 1 visitor group shifts from Gate A to Gate B.

At scale, thousands of such recommendations can influence demand distribution.

The prototype should simulate this relationship.

## Future technical evolution

Production systems could use:

- time-series forecasting
- computer vision
- optimization
- graph routing
- agent-based simulation
- reinforcement learning
- real-time event streams

The prototype should not require those technologies to communicate the concept.
