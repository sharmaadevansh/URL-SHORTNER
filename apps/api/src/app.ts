import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestMetricsMiddleware } from './middleware/requestMetrics.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isDatabaseHealthy } from './infrastructure/database/connection.js';
import { cacheService } from './infrastructure/cache/redis.js';
import { metricsRegistry } from './observability/metrics.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { linksRouter } from './modules/links/links.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { redirectController } from './modules/redirect/redirect.controller.js';

export function createApp() {
  const app = express();

  // Basic security and parsing
  app.use(
    helmet({
      contentSecurityPolicy: false, // relaxed for local dev and redirects
    })
  );

  app.use(
    cors({
      origin: [config.publicAppUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Observability & tracking middleware
  app.use(requestIdMiddleware);
  app.use(requestMetricsMiddleware);

  // Health check endpoints
  app.get('/health/live', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', (_req, res) => {
    const dbHealthy = isDatabaseHealthy();
    const cacheHealthy = cacheService.isHealthy();

    const ready = dbHealthy; // DB is critical, cache has memory fallback

    const status = ready ? 200 : 503;
    res.status(status).json({
      status: ready ? 'ready' : 'not_ready',
      database: dbHealthy ? 'connected' : 'disconnected',
      cache: cacheHealthy ? 'connected' : 'fallback_memory',
      timestamp: new Date().toISOString(),
    });
  });

  // Prometheus Metrics endpoint
  if (config.metricsEnabled) {
    app.get('/metrics', async (_req, res) => {
      try {
        res.set('Content-Type', metricsRegistry.contentType);
        res.end(await metricsRegistry.metrics());
      } catch (err: any) {
        res.status(500).end(err.message);
      }
    });
  }

  // API v1 routes with standard rate limiter
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/links', standardRateLimiter, linksRouter);
  app.use('/api/v1/analytics', standardRateLimiter, analyticsRouter);

  // Redirect path for short codes (GET /:code)
  app.get('/:code', redirectController.handleRedirect);

  // Central error handler
  app.use(errorHandler);

  return app;
}
