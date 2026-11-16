# LinkForge — Architecture Overview

LinkForge is structured as a **modular monolith** monorepo that separates concerns across domains while keeping operational simplicity.

```
                  ┌──────────────────────┐
                  │    Nginx Proxy       │
                  │   (:80 / TLS :443)   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
    (UI / Dashboard)                   (API & Redirects)
            ▼                                 ▼
┌──────────────────────┐           ┌──────────────────────┐
│  Next.js 14 Frontend │           │  Express.js API      │
│  (React 18, Tailwind)│           │  (TypeScript, Node)  │
│  Port: 3000          │           │  Port: 4000          │
└──────────────────────┘           └──────────┬───────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
            ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
            │   Redis Cache    │    │ MongoDB Database │    │ Analytics Queue  │
            │   (Key-value)    │    │ (Source of truth)│    │ (Redis Stream)   │
            │   Port: 6379     │    │ Port: 27017      │    │                  │
            └──────────────────┘    └─────────▲────────┘    └────────┬─────────┘
                                              │                      │
                                              │                      ▼
                                              │             ┌──────────────────┐
                                              └─────────────┤ Analytics Worker │
                                                            │ (Background jobs)│
                                                            └──────────────────┘
```

## Key Modules

1. **Auth Module (`apps/api/src/modules/auth`)**: Handles registration, bcrypt password hashing, JWT token generation, refresh tokens via HttpOnly cookies, and account deletion.
2. **Links Module (`apps/api/src/modules/links`)**: URL normalization, validation, Base62 cryptographic random code generation with collision retry, custom alias support, and MongoDB CRUD.
3. **Redirect Resolver (`apps/api/src/modules/redirect`)**: Fast lookup path checking Redis cache first (`link:{shortCode}`), fallback to MongoDB, expiry and status validation, non-blocking click event emitting, and 302 redirection.
4. **Analytics Pipeline (`apps/api/src/modules/analytics` & `apps/worker`)**: Non-blocking click events published to Redis queue, consumed by the worker, aggregated, and queryable with daily time series and referrer/device/browser breakdowns.
5. **Observability (`apps/api/src/observability`)**: Structured JSON logging with Pino, correlation IDs (`X-Request-Id`), and Prometheus metrics scraped at `/metrics`.
