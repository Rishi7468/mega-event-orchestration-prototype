# 02 — System Mental Model

## 1. The central idea

The product is a **closed-loop orchestration system**.

It does not simply collect data and display dashboards.

It continuously compares:

**what visitors want + what the destination can currently support + what is likely to happen next.**

## 2. Three major layers

```text
                     VISITOR INTENT
                          |
                          v
              +-------------------------+
              |  DESTINATION STATE      |
              |                         |
              | Hotels                  |
              | Transport              |
              | Venues                 |
              | Crowd                  |
              | Event schedule         |
              | Cameras / drones       |
              +------------+------------+
                           |
                           v
                 INTELLIGENCE LAYER
                           |
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
   Capacity            Prediction        Recommendation
   model                 model               model
       |                   |                   |
       +-------------------+-------------------+
                           |
                +----------+----------+
                |                     |
                v                     v
             VISITOR              OPERATOR
             ACTION                ACTION
                |                     |
                +----------+----------+
                           |
                           v
                    DESTINATION STATE
                           |
                           +----> Recalculate
```

## 3. Sense

Inputs may include:

- hotel availability
- accommodation prices
- transport capacity
- route travel time
- venue capacity
- ticket/event schedule
- visitor plans
- crowd counts
- CCTV observations
- drone observations
- weather
- incidents

## 4. Understand

Convert inputs into operational state.

Examples:

- Central hotels: 91% occupied
- North hotels: 48% occupied
- Main shuttle: 86% utilized
- Gate A: 78% occupied
- Central pedestrian zone: rising
- North transport: spare capacity

## 5. Predict

Ask:

> What will happen if nothing changes?

Examples:

- Central hotels reach saturation tomorrow.
- Gate A reaches critical pressure in 8 minutes.
- Shuttle S1 exceeds capacity at 6 PM.
- Visitor's current route becomes 11 minutes slower.

## 6. Decide

Generate recommendations.

Visitor:

> Stay in North Zone.

> Leave at 9:20 AM.

> Use Gate B.

Operator:

> Increase North shuttle frequency.

> Encourage Central arrivals to use Gate B.

## 7. Act

Visitor:

- accepts recommendation,
- changes route,
- changes arrival time,
- chooses different hotel.

Operator:

- approves intervention,
- changes operational plan,
- reallocates capacity.

## 8. Learn

After action:

- pressure changed,
- route improved,
- demand redistributed,
- travel time changed.

This outcome can feed the next recommendation.

## 9. The most important design principle

The visitor and operator are looking at the **same underlying state**, but at different levels.

Example:

System detects Central Zone pressure.

Visitor:

> "North Zone is recommended. It is cheaper and currently less congested."

Operator:

> "Shift approximately 1,200 expected arrivals from Central to North."

This is one orchestration engine serving two audiences.

## 10. The platform is not a collection of apps

Avoid thinking:

> hotel app + maps app + crowd dashboard + chatbot.

Instead think:

> **one event intelligence system with context-aware experiences.**
