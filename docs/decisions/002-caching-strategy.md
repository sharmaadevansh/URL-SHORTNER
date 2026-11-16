# ADR 002: Caching and Invalidation Strategy

## Status
Accepted

## Context
Redirect performance is the primary latency-sensitive path. Under peak loads of 580+ req/s, querying MongoDB for every redirect would create contention and elevate p99 latencies.

## Decision
1. **Cache-Aside with Redis**: The redirect resolver queries `link:{shortCode}` in Redis before querying MongoDB.
2. **Pre-warming**: Newly created short links are immediately written to Redis with a 3600-second TTL.
3. **Bounded TTL with Expiry Check**: Cache TTL never extends beyond the link's expiration date.
4. **Immediate Invalidation**: On link update, deletion, or disabling, the cache entry is immediately purged.
5. **Resilient Fallback**: If Redis becomes unavailable, the system transparently falls back to MongoDB and memory cache without dropping traffic.

## Consequences
- Cache hits resolve in < 5ms.
- Avoids stale links being served after deletion or deactivation.
- Resilient against cache outages.
