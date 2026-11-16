# LinkForge — REST API Documentation

Base URL: `http://localhost:4000/api/v1`

All responses follow the envelope format:
```json
{
  "success": true,
  "data": { ... }
}
```

## Authentication Endpoints

### Register User
- **POST** `/api/v1/auth/register`
- Body: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password123!" }`
- Response `201`: User object and `accessToken`. Sets HttpOnly `refresh_token` cookie.

### Login
- **POST** `/api/v1/auth/login`
- Body: `{ "email": "jane@example.com", "password": "Password123!" }`
- Response `200`: User object and `accessToken`. Sets HttpOnly `refresh_token` cookie.

### Refresh Token
- **POST** `/api/v1/auth/refresh`
- Response `200`: New `accessToken`.

### Get Current User
- **GET** `/api/v1/auth/me`
- Headers: `Authorization: Bearer <accessToken>`
- Response `200`: Current user object.

---

## Link Management Endpoints

### Create Short Link
- **POST** `/api/v1/links`
- Headers: `Authorization: Bearer <accessToken>`
- Body:
  ```json
  {
    "originalUrl": "https://example.com/very/long/url",
    "title": "Optional Title",
    "customAlias": "custom-alias",
    "expiresAt": "2026-12-31T23:59:59Z"
  }
  ```
- Response `201`: Created link document with `shortCode` and `shortUrl`.

### List Links
- **GET** `/api/v1/links?page=1&limit=10&status=all&search=`
- Headers: `Authorization: Bearer <accessToken>`
- Response `200`: Paginated items `{ items: [...], total, page, limit, totalPages }`.

### Get Link Details
- **GET** `/api/v1/links/:id`
- Headers: `Authorization: Bearer <accessToken>`

### Update Link
- **PATCH** `/api/v1/links/:id`
- Headers: `Authorization: Bearer <accessToken>`
- Body: `{ "title": "Updated", "originalUrl": "https://new-url.com", "expiresAt": null }`

### Toggle Status
- **PATCH** `/api/v1/links/:id/status`
- Headers: `Authorization: Bearer <accessToken>`
- Body: `{ "status": "active" | "disabled" }`

### Delete Link
- **DELETE** `/api/v1/links/:id`
- Headers: `Authorization: Bearer <accessToken>`

---

## Redirect Endpoint (Critical Path)

### Redirect Visitor
- **GET** `/:code`
- Response: `302 Found` with `Location` header to destination URL.
- On expired link: `410 Gone`.
- On disabled/non-existent link: `404 Not Found`.

---

## Analytics Endpoints

### Get Link Analytics
- **GET** `/api/v1/links/:id/analytics?range=7d`
- Headers: `Authorization: Bearer <accessToken>`
- Returns: `{ link, totalClicks, todayClicks, timeSeries, referrers, devices, browsers }`

### Account Overview
- **GET** `/api/v1/analytics/overview`
- Headers: `Authorization: Bearer <accessToken>`
- Returns: `{ totalLinks, activeLinks, totalClicks, recentLinks }`

---

## Health & Observability

- **GET** `/health/live` — 200 OK liveness probe
- **GET** `/health/ready` — 200 OK readiness probe checking MongoDB and Redis
- **GET** `/metrics` — Prometheus metrics scrape endpoint
