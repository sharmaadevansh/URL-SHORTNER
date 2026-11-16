# LinkForge --- Production-Ready URL Shortening Platform

A full-stack URL shortening platform designed to demonstrate **backend
engineering, system design, DevOps, cloud deployment, reliability, and
observability**.

LinkForge lets users create and manage short links, redirect visitors,
and inspect click analytics. The application is intentionally designed
as a **modular monolith first**: it keeps the initial system
understandable while establishing clear boundaries that can be scaled
independently when there is a real need.

> **Project status:** Architecture and implementation plan. Features
> described as planned are not claims of completed functionality.

------------------------------------------------------------------------

## Table of contents

-   [1. Project goals](#1-project-goals)
-   [2. Core features](#2-core-features)
-   [3. Technology stack](#3-technology-stack)
-   [4. High-level system design](#4-high-level-system-design)
-   [5. Request flows](#5-request-flows)
-   [6. Application architecture](#6-application-architecture)
-   [7. Data model](#7-data-model)
-   [8. API design](#8-api-design)
-   [9. URL code generation](#9-url-code-generation)
-   [10. Caching and analytics](#10-caching-and-analytics)
-   [11. Security and reliability](#11-security-and-reliability)
-   [12. DevOps and deployment
    strategy](#12-devops-and-deployment-strategy)
-   [13. Observability and testing](#13-observability-and-testing)
-   [14. Repository structure](#14-repository-structure)
-   [15. Implementation milestones](#15-implementation-milestones)
-   [16. Local development](#16-local-development)
-   [17. Configuration](#17-configuration)
-   [18. Engineering decisions and
    trade-offs](#18-engineering-decisions-and-trade-offs)
-   [19. Future improvements](#19-future-improvements)

------------------------------------------------------------------------

## 1. Project goals

The goal is not just to build a form that converts a long URL into a
short URL. LinkForge is a small production-style web system that
explores the engineering concerns behind a redirect service:

1.  **Fast redirects:** resolve a short code with minimal latency.
2.  **Reliable persistence:** store URL mappings and ownership in
    MongoDB.
3.  **Efficient reads:** use Redis as a cache in front of MongoDB.
4.  **Decoupled analytics:** record click events asynchronously so
    analytics work does not slow down redirects.
5.  **Safe operations:** validate URLs, rate-limit abuse, protect
    secrets, and provide health checks.
6.  **Repeatable delivery:** test, build, scan, package, and deploy
    through an automated CI/CD pipeline.
7.  **Operational visibility:** measure latency, traffic, errors, cache
    performance, and background-job health.

### Primary learning outcomes

-   Design REST APIs and MongoDB schemas.
-   Understand indexing, caching, asynchronous processing, and
    idempotency.
-   Containerize a multi-component application with Docker.
-   Build CI/CD workflows using GitHub Actions.
-   Deploy to AWS EC2 and manage infrastructure with Terraform.
-   Add structured logs, metrics, health checks, and rollback
    procedures.

------------------------------------------------------------------------

## 2. Core features

### User-facing features

-   Register, log in, and log out.
-   Create a short URL from a valid destination URL.
-   Generate a random short code or request a custom alias.
-   Set an optional expiration date.
-   List, search, edit, disable, and delete owned links.
-   View total clicks and click trends.
-   View available referrer, device, and browser analytics.
-   Copy and share generated short links.

### Redirect features

-   Resolve `https://your-domain.com/:code`.
-   Return an HTTP redirect to the stored destination.
-   Use Redis cache for frequently accessed mappings.
-   Fall back to MongoDB on a cache miss.
-   Return a clear not-found response for unknown, disabled, or expired
    links.
-   Record click events asynchronously.

### Admin and operations features

-   Health and readiness endpoints.
-   Request rate limiting.
-   Structured application logs.
-   Metrics for requests, redirects, errors, and latency.
-   Background worker health visibility.
-   CI checks for tests, linting, dependency vulnerabilities, and
    container build.
-   Deployment history and a documented rollback procedure.

**Privacy note:** Analytics should avoid collecting unnecessary personal
data. IP addresses should not be stored in raw form by default. If
approximate geography is later added, document the data source,
retention, and privacy implications.

------------------------------------------------------------------------

## 3. Technology stack

The stack uses technologies that are practical for a React/Node.js
developer and leaves room for more advanced infrastructure work.

  ---------------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- ---------------------------
  Frontend                React + Next.js +       Dashboard, forms, link
                          TypeScript              management, analytics UI

  Backend API             Node.js + Express +     Authentication, link APIs,
                          TypeScript              redirect logic

  Database                MongoDB                 Users, URL mappings,
                                                  click-event metadata

  Cache                   Redis                   Short-code-to-destination
                                                  lookup cache

  Background processing   Redis Streams or BullMQ Asynchronous click
                                                  analytics

  Reverse proxy           Nginx                   TLS termination and request
                                                  routing

  Containerization        Docker + Docker Compose Reproducible application
                                                  environments

  CI/CD                   GitHub Actions          Automated checks, image
                                                  build, deployment

  Container registry      Amazon ECR              Versioned Docker images

  Cloud                   AWS EC2                 Initial application hosting

  Infrastructure as Code  Terraform               Reproducible AWS
                                                  provisioning

  Monitoring              Prometheus + Grafana    Metrics and dashboards

  Logging                 Pino / structured JSON  Application and worker logs
                          logs                    

  Testing                 Jest or Vitest +        Unit and API integration
                          Supertest               tests

  Load testing            k6                      Redirect throughput and
                                                  latency tests
  ---------------------------------------------------------------------------

### Why Next.js and Express?

-   **Next.js is the React application**: routing, layouts, server
    rendering where useful, and the user dashboard.
-   **Express is the backend API**: authentication, link management,
    redirects, and analytics ingestion.
-   Keeping the API separate makes its deployment, testing, scaling, and
    monitoring explicit.
-   Next.js server components or server-side rendering can be used for
    the UI, but business rules and data access remain in the backend
    API.

This avoids maintaining two competing places for core business logic.

------------------------------------------------------------------------

## 4. High-level system design

### 4.1 Logical architecture

``` mermaid
flowchart TD
    U[User / Browser] --> N[Nginx Reverse Proxy]
    N --> FE[Next.js React Frontend]
    N --> API[Node.js Express API]

    FE --> API
    API --> AUTH[Authentication and Authorization]
    API --> LINK[Link Management Module]
    API --> REDIR[Redirect Resolver]
    API --> ANALYTICS[Analytics Query Module]

    LINK --> M[(MongoDB)]
    REDIR --> R[(Redis Cache)]
    REDIR --> M

    REDIR --> Q[Analytics Event Queue]
    Q --> W[Analytics Worker]
    W --> M

    API --> LOG[Structured Logs]
    W --> LOG
    API --> METRICS[Prometheus Metrics]
    W --> METRICS
    METRICS --> G[Grafana Dashboards]
```

### 4.2 Deployment architecture --- initial AWS EC2 version

``` mermaid
flowchart TD
    DEV[Developer] --> GH[GitHub Repository]
    GH --> GHA[GitHub Actions CI/CD]
    GHA --> TEST[Lint and Automated Tests]
    TEST --> BUILD[Build Docker Images]
    BUILD --> ECR[Amazon ECR]
    GHA -->|Secure deployment connection| EC2[AWS EC2 Instance]

    ECR -->|Pull versioned images| EC2
    EC2 --> NG[Nginx]
    NG --> WEB[Next.js Container]
    NG --> API[Express API Container]
    API --> REDIS[Redis Container]
    API --> DB[(MongoDB)]

    API --> WORKER[Analytics Worker Container]
    WORKER --> DB
    EC2 --> PROM[Prometheus]
    PROM --> GRAF[Grafana]
```

**Initial deployment note:** The first version can run the frontend,
API, worker, Redis, and MongoDB using Docker Compose on one EC2
instance. This is a learning and portfolio deployment, not a claim of
high availability. A single EC2 host and single database are failure
points.

**Production evolution:** Move MongoDB to MongoDB Atlas or a managed
database, use managed Redis where appropriate, place multiple
application instances behind an AWS Application Load Balancer, and
consider ECS or EKS when orchestration needs justify the added
complexity.

### 4.3 Main components

  Component           Responsibility
  ------------------- ------------------------------------------------
  Next.js frontend    User experience and dashboard
  Express API         Business logic and HTTP API
  Redirect resolver   Resolve short codes and issue redirects
  MongoDB             Durable source of truth
  Redis               Low-latency cache and queue support
  Analytics worker    Process click events outside redirect request
  Nginx               Reverse proxy and routing
  Prometheus          Collect application and infrastructure metrics
  Grafana             Visualize operational metrics

------------------------------------------------------------------------

## 5. Request flows

### 5.1 Create a short URL

1.  An authenticated user submits a destination URL in the Next.js
    dashboard.
2.  The frontend sends `POST /api/v1/links` to the Express API.
3.  The API validates the URL and checks the user's permissions and rate
    limit.
4.  The service generates a unique short code, or validates the
    requested custom alias.
5.  The URL mapping is saved in MongoDB with an owner, status, and
    optional expiry.
6.  The API returns the short URL and link metadata.
7.  The frontend displays the result.

### 5.2 Redirect a visitor

1.  A visitor requests `GET /:code`.
2.  Nginx forwards the request to the redirect endpoint in the API.
3.  The resolver checks Redis for the short code.
4.  On a cache hit, the destination is returned from Redis.
5.  On a cache miss, the resolver queries MongoDB and populates Redis.
6.  The resolver checks whether the link exists, is active, and has not
    expired.
7.  The API responds with an HTTP redirect.
8.  A click event is published to the analytics queue without waiting
    for analytics aggregation.

``` mermaid
sequenceDiagram
    participant B as Browser
    participant API as Express API
    participant R as Redis
    participant DB as MongoDB
    participant Q as Event Queue
    participant W as Analytics Worker

    B->>API: GET /:code
    API->>R: GET link:{code}
    alt Cache hit
        R-->>API: Destination URL
    else Cache miss
        R-->>API: Not found in cache
        API->>DB: Find active link by code
        DB-->>API: Link document
        API->>R: SET link:{code} with TTL
    end
    API->>Q: Publish click event
    API-->>B: 302 Location: destination
    Q-->>W: Deliver click event
    W->>DB: Persist / aggregate analytics
```

**Redirect status:** Use `302` by default so destinations can be changed
and redirects are not permanently cached by clients. A deliberate `301`
option can be considered later, with the caching implications
documented.

### 5.3 Analytics processing

The redirect path should not wait for expensive analytics calculations.

-   The redirect service publishes a small event.
-   A background worker consumes events.
-   The worker validates and aggregates the event.
-   Aggregated analytics are stored for dashboard queries.
-   Failed jobs are retried with bounded retries and moved to a
    dead-letter mechanism after repeated failure.

The queue is not a substitute for durable storage. Choose and configure
its persistence, acknowledgement, retry, and retention behavior
deliberately.

------------------------------------------------------------------------

## 6. Application architecture

Use a modular monolith for the backend. Modules share one deployable API
initially, but each has clear ownership and interfaces.

### Backend modules

  Module           Responsibilities
  ---------------- ---------------------------------------------
  Auth             Registration, login, token/session handling
  Users            User profile and account settings
  Links            Create, list, update, disable, delete links
  Redirect         Resolve codes, check status and expiry
  Analytics        Query click summaries and trends
  Events           Publish and validate click events
  Worker           Consume events and update analytics
  Infrastructure   MongoDB, Redis, queue, logging, metrics

### Suggested backend layering

``` text
HTTP Route
   |
   v
Controller
   |
   v
Service (business rules)
   |
   v
Repository (database operations)
   |
   v
MongoDB / Redis
```

-   **Routes** define HTTP endpoints and middleware.
-   **Controllers** parse requests and shape responses.
-   **Services** implement business rules.
-   **Repositories** encapsulate persistence queries.
-   **Workers** process asynchronous jobs.
-   **Middleware** handles authentication, validation, rate limiting,
    and error handling.

Avoid putting database queries and business logic directly inside route
handlers.

------------------------------------------------------------------------

## 7. Data model

MongoDB is the durable source of truth. Use Mongoose schemas or the
official MongoDB driver, and create indexes deliberately.

### 7.1 User

``` javascript
{
  _id: ObjectId,
  name: String,
  email: String,          // unique, normalized
  passwordHash: String,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: - Unique index on normalized `email`.

### 7.2 Link

``` javascript
{
  _id: ObjectId,
  ownerId: ObjectId,
  shortCode: String,
  originalUrl: String,
  title: String,
  status: "active" | "disabled",
  expiresAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: - Unique index on `shortCode`. - Compound index on
`{ ownerId: 1, createdAt: -1 }` for dashboard listing. - Optional TTL
index on `expiresAt` only if automatic document deletion is desired.

**Important:** MongoDB TTL deletion is asynchronous and should not be
used as the correctness check for expiration. The redirect resolver must
explicitly check `expiresAt` on every cache miss and must not serve an
expired cached mapping. Cache TTL should not extend beyond the link's
expiry.

### 7.3 ClickEvent

``` javascript
{
  _id: ObjectId,
  linkId: ObjectId,
  shortCode: String,
  occurredAt: Date,
  referrerHost: String | null,
  deviceType: String | null,
  browserFamily: String | null,
  countryCode: String | null
}
```

Do not store raw IP addresses by default. Device, browser, and geography
fields are optional and should be derived only where lawful and useful.

Indexes: - `{ linkId: 1, occurredAt: -1 }` for link analytics. -
`{ occurredAt: -1 }` for time-based processing and reporting.

### 7.4 AnalyticsSummary (optional aggregation collection)

``` javascript
{
  _id: ObjectId,
  linkId: ObjectId,
  bucketStart: Date,
  bucketSize: "hour" | "day",
  totalClicks: Number,
  updatedAt: Date
}
```

Unique compound index: - `{ linkId: 1, bucketStart: 1, bucketSize: 1 }`.

This collection is an optimization. Start with querying click events for
small datasets, then introduce aggregation summaries when measured query
cost warrants it.

### Relationships

``` mermaid
erDiagram
    USER ||--o{ LINK : owns
    LINK ||--o{ CLICK_EVENT : receives
    LINK ||--o{ ANALYTICS_SUMMARY : aggregates

    USER {
        ObjectId id
        string email
        string passwordHash
        string role
    }
    LINK {
        ObjectId id
        ObjectId ownerId
        string shortCode
        string originalUrl
        string status
        date expiresAt
    }
    CLICK_EVENT {
        ObjectId id
        ObjectId linkId
        date occurredAt
        string referrerHost
        string deviceType
    }
    ANALYTICS_SUMMARY {
        ObjectId id
        ObjectId linkId
        date bucketStart
        number totalClicks
    }
```

------------------------------------------------------------------------

## 8. API design

All management APIs are versioned under `/api/v1`.

### Authentication

  Method   Endpoint                  Purpose
  -------- ------------------------- -------------------
  POST     `/api/v1/auth/register`   Create an account
  POST     `/api/v1/auth/login`      Authenticate
  POST     `/api/v1/auth/logout`     End the session
  GET      `/api/v1/auth/me`         Get current user

### Link management

  Method   Endpoint                     Purpose
  -------- ---------------------------- --------------------------------------
  POST     `/api/v1/links`              Create a short link
  GET      `/api/v1/links`              List current user's links
  GET      `/api/v1/links/:id`          Get link details
  PATCH    `/api/v1/links/:id`          Update title, destination, or expiry
  PATCH    `/api/v1/links/:id/status`   Enable or disable a link
  DELETE   `/api/v1/links/:id`          Delete a link

### Redirect

  Method   Endpoint   Purpose
  -------- ---------- ----------------------
  GET      `/:code`   Resolve and redirect

### Analytics and operations

  Method   Endpoint                        Purpose
  -------- ------------------------------- -------------------------------------
  GET      `/api/v1/links/:id/analytics`   Get link analytics
  GET      `/api/v1/analytics/overview`    Get account-level analytics
  GET      `/health/live`                  Liveness check
  GET      `/health/ready`                 Readiness check
  GET      `/metrics`                      Prometheus metrics; restrict access

### Example: create a link

Request:

``` http
POST /api/v1/links
Content-Type: application/json
Authorization: Bearer <access-token>
```

``` json
{
  "originalUrl": "https://example.com/articles/system-design",
  "customAlias": "system-design",
  "expiresAt": null
}
```

Example response:

``` json
{
  "success": true,
  "data": {
    "shortCode": "system-design",
    "shortUrl": "https://lnk.example/system-design",
    "originalUrl": "https://example.com/articles/system-design",
    "status": "active"
  }
}
```

The response is illustrative. The production API should use consistent
error codes, validation messages, pagination, and request IDs.

------------------------------------------------------------------------

## 9. URL code generation

A short code must be unique and URL-safe.

### Initial approach

-   Generate a cryptographically secure random value.
-   Encode it using a URL-safe alphabet such as Base62.
-   Attempt an insert with a unique MongoDB index on `shortCode`.
-   If a duplicate-key conflict occurs, generate another code and retry
    a bounded number of times.

Do not rely only on checking whether a code exists before insertion: two
concurrent requests can pass that check. The unique database index is
the final authority.

### Custom aliases

-   Normalize and validate allowed characters.
-   Enforce a maximum length.
-   Reject reserved routes such as `api`, `health`, `admin`, and
    `login`.
-   Enforce uniqueness through the same unique index.
-   Apply stricter rate limits to alias creation.

------------------------------------------------------------------------

## 10. Caching and analytics

### 10.1 Redis cache

Suggested key:

``` text
link:{shortCode} -> serialized redirect record
```

Cache record should include enough information to validate status and
expiry, not just the destination URL.

Cache behavior: 1. Read from Redis. 2. On miss, query MongoDB. 3. Verify
link status and expiry. 4. Cache only valid records. 5. On link update
or disable, invalidate the corresponding cache key. 6. Set a bounded TTL
and never let it exceed the link's remaining lifetime.

### 10.2 Cache stampede and failure handling

-   Use short-lived negative caching carefully for unknown codes.
-   Consider request coalescing for popular cache misses.
-   If Redis is unavailable, fall back to MongoDB with sensible timeouts
    and rate limits.
-   Monitor cache hit ratio and Redis errors.
-   Do not allow a cache failure to make stale or expired links valid.

### 10.3 Analytics queue

Start with Redis Streams or BullMQ backed by Redis. Keep the queue
interface behind an application module so it can be replaced later.

The worker should: - Validate event shape. - Process events idempotently
where possible. - Retry transient errors with backoff. - Avoid unbounded
retries. - Expose queue depth and processing-failure metrics.

------------------------------------------------------------------------

## 11. Security and reliability

### Security controls

-   Hash passwords using Argon2id or bcrypt with an appropriate work
    factor.
-   Validate and normalize all incoming URLs.
-   Permit only `http` and `https` schemes.
-   Reject dangerous schemes such as `javascript:` and `data:`.
-   Apply authentication and ownership checks to link-management APIs.
-   Rate-limit account creation, login, link creation, and redirects
    where appropriate.
-   Use secure, HttpOnly, SameSite cookies if using cookie-based
    sessions.
-   Protect cookie-authenticated state-changing routes against CSRF.
-   Configure CORS with explicit trusted origins.
-   Store secrets in environment variables or a secret manager, never in
    Git.
-   Run containers as non-root users.
-   Scan dependencies and container images.
-   Restrict MongoDB, Redis, and metrics ports from public access.
-   Use HTTPS in deployed environments.

### SSRF consideration

The initial redirect service should not fetch the destination URL. It
should validate and store it, then issue a redirect. If link preview
generation is added later, treat it as an SSRF-sensitive feature: block
private, loopback, link-local, and metadata-service addresses;
revalidate DNS resolutions; restrict redirects and outbound protocols;
and apply network-level egress controls.

### Reliability controls

-   Liveness and readiness checks.
-   Graceful shutdown and connection draining.
-   Bounded request and database timeouts.
-   Retry only operations that are safe to retry.
-   Health checks before shifting deployment traffic.
-   Database backups and restore testing.
-   Documented rollback procedure.
-   Load tests with defined latency and error-rate targets.

------------------------------------------------------------------------

## 12. DevOps and deployment strategy

DevOps is a first-class part of LinkForge, not an afterthought.

### 12.1 Docker

Build separate images for: - Next.js frontend. - Express API. -
Analytics worker.

Use multi-stage builds, pinned base-image versions, `.dockerignore`,
non-root users, and health checks where appropriate.

Docker Compose should provide a repeatable local environment
containing: - Frontend. - API. - Worker. - MongoDB. - Redis. - Nginx
(optional in local development).

### 12.2 CI pipeline --- GitHub Actions

Trigger on pull requests and pushes to the main branch.

``` mermaid
flowchart TD
    A[Push / Pull Request] --> B[Install Dependencies]
    B --> C[Lint and Type Check]
    C --> D[Unit and Integration Tests]
    D --> E[Dependency and Secret Scans]
    E --> F[Build Docker Images]
    F --> G[Container Image Scan]
    G --> H{Main Branch?}
    H -->|No| I[Publish CI Results]
    H -->|Yes| J[Push Versioned Images to ECR]
```

CI should: - Install dependencies using lockfiles. - Run linting and
type checks. - Run unit and integration tests. - Validate Docker
builds. - Scan dependencies and images. - Publish test and scan
results. - Avoid exposing deployment credentials to untrusted
pull-request code.

### 12.3 CD pipeline --- AWS EC2

``` mermaid
flowchart TD
    A[Successful Main Branch CI] --> B[Publish Images to ECR]
    B --> C[Connect to Deployment Host Securely]
    C --> D[Pull Immutable Image Tags]
    D --> E[Start New Application Version]
    E --> F[Run Health Checks]
    F --> G{Healthy?}
    G -->|Yes| H[Switch Traffic]
    G -->|No| I[Restore Previous Version]
    H --> J[Record Deployment]
    I --> K[Record Failure and Alert]
```

Use immutable image tags such as the Git commit SHA. Avoid relying only
on `latest`, because it makes rollbacks and auditability harder.

### 12.4 AWS infrastructure

Initial EC2 setup: - One Ubuntu EC2 instance for the first deployment. -
Security group allowing HTTPS and only the required administrative
access. - Nginx as the public entry point. - Application containers on a
private Docker network. - MongoDB and Redis ports not exposed
publicly. - ECR for container images. - IAM role for the EC2 instance to
pull images from ECR. - GitHub-to-AWS authentication through OIDC where
practical, instead of long-lived AWS access keys.

Terraform should provision the infrastructure and keep configuration
reproducible.

**Cost and availability:** A single EC2 instance is suitable for a
learning deployment but is not highly available. Check current AWS
pricing and Free Tier eligibility before provisioning. Add managed
services and multiple instances only when the project needs them.

------------------------------------------------------------------------

## 13. Observability and testing

### 13.1 Metrics

Expose application metrics such as:

  Metric                      Why it matters
  --------------------------- ------------------------------
  HTTP request count          Traffic volume
  Request latency             User experience
  HTTP error rate             Application reliability
  Redirect count              Core service usage
  Redis cache hit/miss        Cache effectiveness
  MongoDB operation latency   Database performance
  Queue depth                 Analytics processing backlog
  Worker failures             Background processing health
  CPU and memory              Infrastructure capacity

Use Prometheus to collect metrics and Grafana to visualize them. Avoid
high-cardinality labels such as raw URLs, user IDs, or arbitrary short
codes.

### 13.2 Logging

Use structured JSON logs with: - Timestamp. - Log level. - Request ID. -
Route or operation. - Response status. - Duration. - Error category.

Never log passwords, tokens, session cookies, or sensitive personal
information.

### 13.3 Testing strategy

-   **Unit tests:** code generation, URL validation, expiry rules, and
    business logic.
-   **Integration tests:** MongoDB repositories, Redis cache behavior,
    and queue processing.
-   **API tests:** authentication, link creation, permissions,
    redirects, and analytics.
-   **End-to-end tests:** key dashboard and link workflows.
-   **Load tests:** redirect throughput, latency percentiles, and cache
    hit behavior.
-   **Failure tests:** Redis unavailable, worker restart, database
    timeout, and failed deployment.

Use k6 to test the redirect endpoint. Record the test environment,
request rate, concurrency, error rate, and p50/p95/p99 latency. Do not
publish performance claims without reproducible measurements.

------------------------------------------------------------------------

## 14. Repository structure

A monorepo keeps the frontend, API, worker, and deployment configuration
together while preserving separate build and runtime boundaries.

``` text
linkforge/
│
├── apps/
│   ├── web/                         # Next.js + React frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── api/                         # Node.js + Express API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── links/
│   │   │   │   ├── redirect/
│   │   │   │   └── analytics/
│   │   │   ├── middleware/
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   ├── cache/
│   │   │   │   └── queue/
│   │   │   ├── observability/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── worker/                      # Analytics background worker
│       ├── src/
│       ├── tests/
│       └── package.json
│
├── packages/
│   └── shared/                      # Shared types and validation schemas
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── terraform/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── deployment.md
│   └── decisions/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

The exact structure can evolve during implementation. Keep shared code
small; do not create abstractions before they are needed.

------------------------------------------------------------------------

## 15. Implementation milestones

Build incrementally. Each milestone should have working code, tests, and
a Git commit.

  -----------------------------------------------------------------------
  Milestone               Deliverable             Main technologies
  ----------------------- ----------------------- -----------------------
  1\. Foundation          Monorepo, Next.js UI,   React, Next.js, Node,
                          Express API, MongoDB    MongoDB
                          connection              

  2\. Core URL service    Authentication,         Express, MongoDB
                          create/list/delete      
                          links, redirects        

  3\. Data correctness    Unique codes, indexes,  MongoDB, Mongoose
                          expiry, validation      

  4\. Performance         Redis cache and         Redis
                          invalidation            

  5\. Analytics           Event queue, worker,    Redis Streams/BullMQ,
                          analytics APIs          MongoDB

  6\. Containerization    Separate images and     Docker, Compose
                          local environment       

  7\. Continuous          Tests, lint, type       GitHub Actions
  integration             checks, scans           

  8\. Cloud deployment    ECR, EC2, Nginx,        AWS, Docker
                          automated deployment    

  9\. Infrastructure as   Reproducible cloud      Terraform
  Code                    provisioning            

  10\. Observability      Metrics, dashboards,    Prometheus, Grafana
                          structured logs         

  11\. Reliability        Load tests, failure     k6, GitHub Actions
                          handling, rollback      

  12\. Advanced scaling   Multiple API instances  Load balancer,
                          and orchestration       Kubernetes (optional)
  -----------------------------------------------------------------------

### Definition of done for the first deployable release

-   A user can create a link and be redirected correctly.
-   Link ownership and expiry are enforced.
-   API and worker tests pass in CI.
-   Images build reproducibly.
-   A successful main-branch build can deploy to EC2.
-   Health checks verify the deployed version.
-   The previous version can be restored.
-   Secrets and database ports are not exposed publicly.
-   Setup and deployment steps are documented.

------------------------------------------------------------------------

## 16. Local development

### Prerequisites

Install: - Node.js LTS. - npm. - Git. - Docker Desktop or Docker
Engine. - A code editor such as VS Code.

### Clone the repository

``` bash
git clone <your-repository-url>
cd linkforge
```

### Configure environment variables

``` bash
cp .env.example .env
```

Fill in local development values. Never commit `.env`.

### Start infrastructure

Once `docker-compose.yml` is implemented:

``` bash
docker compose up -d mongodb redis
```

### Install dependencies and start applications

The exact commands depend on the package manager and workspace
configuration selected during implementation. A typical development
workflow will start the API, frontend, and worker in separate terminal
sessions.

Example intended local endpoints:

  Service            Local URL
  ------------------ --------------------------------------
  Next.js frontend   `http://localhost:3000`
  Express API        `http://localhost:4000`
  API liveness       `http://localhost:4000/health/live`
  API readiness      `http://localhost:4000/health/ready`

These ports are proposed defaults and can be changed in configuration.

------------------------------------------------------------------------

## 17. Configuration

Create `.env.example` with variable names and safe placeholders only:

``` dotenv
# Application
NODE_ENV=development
WEB_PORT=3000
API_PORT=4000
PUBLIC_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:4000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/linkforge

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret

# Observability
LOG_LEVEL=debug
METRICS_ENABLED=true
```

For production: - Use a managed secrets solution or securely injected
environment variables. - Use separate credentials per environment. -
Rotate secrets when needed. - Never use the example secrets above as
production secrets. - Do not expose server-only secrets through Next.js
public environment variables.

------------------------------------------------------------------------

## 18. Engineering decisions and trade-offs

  -----------------------------------------------------------------------
  Decision                Initial choice          Reason / trade-off
  ----------------------- ----------------------- -----------------------
  Backend architecture    Modular monolith        Easier to build, test,
                                                  and operate than
                                                  premature microservices

  Database                MongoDB                 Familiar document model
                                                  and flexible link
                                                  metadata

  Cache                   Redis                   Fast lookup path for
                                                  frequently requested
                                                  codes

  Analytics               Background worker       Keeps redirect path
                                                  independent of
                                                  analytics persistence

  Frontend                Next.js + React         React ecosystem with
                                                  routing and rendering
                                                  options

  API                     Express                 Explicit API boundary
                                                  and straightforward
                                                  Node.js implementation

  Deployment              Docker Compose on EC2   Practical first cloud
                                                  deployment; single-host
                                                  failure risk

  CI/CD                   GitHub Actions          Repository-native
                                                  automation

  IaC                     Terraform               Repeatable
                                                  infrastructure changes

  Scaling                 Measure before          Avoid operational
                          splitting services      complexity without
                                                  evidence
  -----------------------------------------------------------------------

### Important trade-offs to document as the project evolves

-   MongoDB versus a relational database for analytics queries.
-   Redis cache TTL versus immediate invalidation.
-   Synchronous versus asynchronous click-event recording.
-   At-most-once versus at-least-once event processing.
-   Single EC2 deployment versus multi-instance high availability.
-   Modular monolith versus extracting independent services.
-   Cost, complexity, and operational overhead of Kubernetes.

Add Architecture Decision Records (ADRs) under `docs/decisions/` when
making significant design choices.

------------------------------------------------------------------------

## 19. Future improvements

After the core platform is stable, consider:

-   Custom domains for short links.
-   QR code generation.
-   Password-protected links.
-   Link expiration and scheduled activation.
-   Team accounts and role-based access.
-   Abuse detection and malicious URL reputation checks.
-   Multi-region redirect infrastructure.
-   CDN integration.
-   Kubernetes deployment with Helm.
-   Autoscaling based on measured load.
-   OpenTelemetry distributed tracing.
-   Advanced anomaly detection for traffic patterns.

------------------------------------------------------------------------

## Project principles

1.  **Build the simplest correct system first.** Do not introduce
    microservices or Kubernetes merely to list them on a resume.
2.  **Measure performance.** Use load tests and dashboards instead of
    unsupported claims.
3.  **Automate repeatable work.** Builds, tests, scans, and deployments
    should be reproducible.
4.  **Design for failure.** Redis, MongoDB, workers, and deployments can
    fail; define behavior for each.
5.  **Secure by default.** Protect secrets, validate inputs, restrict
    network access, and apply least privilege.
6.  **Document engineering decisions.** Explain why a component exists
    and what trade-offs it introduces.

------------------------------------------------------------------------

## License

Choose a license before making the repository public. If this is a
portfolio project, an MIT license is a common option, provided it
matches your intended reuse terms.
