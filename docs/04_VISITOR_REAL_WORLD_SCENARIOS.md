# 04 — Visitor Real-World Scenarios

This document prevents the visitor interface from becoming a generic travel dashboard.

The prototype should feel like it is being used by real people in realistic situations.

## Scenario 1 — Planning before travel

### Context

A visitor is attending a large pilgrimage/event in two days.

They need two nights of accommodation.

### User intent

> "Find me a good place to stay under ₹2,000 per night."

### System context

Central:

- 90%+ accommodation utilization
- high price
- high predicted crowd

North:

- high room availability
- direct shuttle
- moderate crowd

East:

- very high room availability
- low price
- longer journey

### Recommendation

North.

### Visitor-facing explanation

> North Zone gives you the best balance of price, availability, transport, and expected crowd levels.

### Why this matters

The system is balancing demand rather than simply returning nearest hotels.

---

## Scenario 2 — Visitor is already travelling

### Context

The visitor has checked into the North Zone hotel.

They open the app at 8:30 AM.

### System shows

> You're on track for your 10:00 AM arrival.

Journey:

Hotel → Transit Hub → Shuttle S3 → Gate B.

### Why this matters

The app becomes useful during the event, not just during booking.

---

## Scenario 3 — Crowd surge

### Context

CCTV/site-camera analytics detect increased density near Gate A.

### System prediction

> Gate A may become significantly congested within 12 minutes.

### Visitor sees

> Gate B currently has shorter waits.

> **Recommended: use Gate B.**

### Action

`Update My Route`

### Why this matters

Raw computer vision becomes a useful visitor decision.

---

## Scenario 4 — Event schedule change

### Context

A major program is moved from 6 PM to 5 PM.

Expected attendance around the venue increases sharply.

### System effect

Existing visitor plans are recalculated.

### Visitor sees

> Your current arrival window overlaps with projected peak demand.

Recommended options:

1. arrive 35 minutes earlier,
2. use another entrance,
3. arrive after the peak.

### Why this matters

The platform reacts to event-driven changes, a central requirement of the challenge.

---

## Scenario 5 — Hotel saturation

### Context

The visitor searches for a hotel close to the venue.

Central has very little inventory.

### Instead of

> Sold out.

### System says

> Central Zone is nearing capacity.

> North Zone has significantly more availability and a direct shuttle.

### Recommendation

North Zone.

### Why this matters

The system uses destination-level capacity to improve individual choice.

---

## Scenario 6 — Transport congestion

### Context

The visitor's chosen shuttle becomes overloaded.

### System sees

- route utilization increasing
- predicted wait increasing

### Visitor sees

> Shuttle S1 is becoming crowded.

> **S3 is currently 9 minutes faster.**

Action:

`Switch to S3`

### Why this matters

The recommendation changes with live transport state.

---

## Scenario 7 — The visitor is already near the venue

### Context

The visitor is physically walking toward the venue.

### System sees

Gate A crowd rising.

### Mobile card

> **You're near Central Gate**

> Gate A wait: 18 min

> Gate B wait: 7 min

> Walk to Gate B: 6 min

CTA:

`Navigate to Gate B`

### Why this matters

This is a realistic "in-the-moment" use case.

---

## Scenario 8 — Incentive-based redistribution

Future concept, optional in prototype.

### Context

Central is overloaded while East has significant spare capacity.

### System could offer

> Stay in East Zone and receive a transport credit.

The visitor gets value.

The destination gets better distribution.

Do not implement a real payment/reward system for the prototype.

---

## Scenario priority

For the demo, prioritize:

1. accommodation recommendation
2. journey recommendation
3. sudden crowd/demand change
4. visitor re-optimization
5. operator demand balancing

These five scenarios tell the strongest story.
