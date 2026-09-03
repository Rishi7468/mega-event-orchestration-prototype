# 09 — Mobile UX Principles

## 1. Mobile is the primary visitor device

The visitor is likely to use the platform while:

- travelling,
- walking,
- waiting,
- carrying luggage,
- navigating a crowded destination.

Therefore the visitor UI must not be a shrunken desktop dashboard.

## 2. One primary action

Every important screen should have one obvious action.

Examples:

- Plan My Visit
- Choose this stay
- Start Journey
- Update My Route
- Navigate to Gate B

## 3. Progressive disclosure

Show the decision first.

Allow the visitor to open details if they want to know why.

Example:

Primary:

> North Zone recommended.

Expandable:

> Why?

Then:

- availability
- price
- transport
- crowd
- predicted pressure

## 4. Touch targets

Use comfortable touch areas.

Avoid tiny map controls and densely packed buttons.

## 5. Glanceability

A visitor should understand the current state within a few seconds.

Use:

- large time values
- clear route steps
- simple status labels
- short recommendation copy

## 6. Avoid raw analytics

Do not show unnecessary:

- risk formulas
- dense charts
- dozens of metrics.

Translate analytics into decisions.

Bad:

> Density 83.6%, route utilization 76%.

Better:

> Gate A is becoming crowded. Gate B is currently faster.

## 7. Calm alerts

Most alerts should be advisory.

Use critical alerts only for genuinely urgent conditions.

## 8. Maps

Use maps when they answer:

> Where should I go?

Do not show maps merely because this is a travel application.

## 9. Offline/failure thinking

For the prototype, external network failures should not break the demo.

Prefer local mock data and local assets.

## 10. Context-aware recommendations

The same condition should be translated based on where the visitor is.

Before trip:

> North Zone is recommended for your stay.

During trip:

> Take Shuttle S3.

Near venue:

> Use Gate B.

## 11. Accessibility

Use:

- readable typography
- sufficient contrast
- semantic controls
- status labels beyond color
- clear icons
- concise language

## 12. Real-world feel

The app should behave like a utility, not a presentation.

The visitor should be able to imagine using it while attending an actual mega-event.
