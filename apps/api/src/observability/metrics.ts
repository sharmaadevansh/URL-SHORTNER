import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'linkforge_' });

export const httpRequestsTotal = new client.Counter({
  name: 'linkforge_http_requests_total',
  help: 'Total number of HTTP requests handled',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'linkforge_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export const redirectsTotal = new client.Counter({
  name: 'linkforge_redirects_total',
  help: 'Total number of short link redirects executed',
  labelNames: ['status', 'cache_hit'],
});

export const cacheOperationsTotal = new client.Counter({
  name: 'linkforge_cache_operations_total',
  help: 'Cache read/write operations and results',
  labelNames: ['operation', 'result'],
});

export const metricsRegistry = client.register;
