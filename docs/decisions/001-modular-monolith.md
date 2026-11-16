# ADR 001: Modular Monolith vs Microservices

## Status
Accepted

## Context
A URL shortening service has disparate concerns: low-latency redirection, user management, link administration, and heavy analytics ingestion. While microservices offer independent deployment, they introduce network boundaries, distributed transactions, elevated cloud costs, and operational complexity.

## Decision
We chose a **modular monolith** with clear architectural boundaries:
- Distinct domains (`auth`, `links`, `redirect`, `analytics`).
- Separation of concerns via Routes -> Controllers -> Services -> Repositories.
- Shared contracts package (`@linkforge/shared`) ensuring end-to-end type safety.
- Dedicated background worker (`apps/worker`) communicating over Redis queues.

## Consequences
- Fast local iteration with straightforward debugging.
- No network serialization overhead between domain services.
- If redirect load spikes in the future, the redirect module can be extracted into an edge microservice without rewriting the domain logic.
