import { httpRequestsTotal, httpRequestDurationSeconds } from '../observability/metrics.js';
export function requestMetricsMiddleware(req, res, next) {
    const start = process.hrtime();
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds + nanoseconds / 1e9;
        const route = req.route?.path || req.baseUrl || req.path || 'unknown';
        const statusCode = res.statusCode.toString();
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: statusCode,
        });
        httpRequestDurationSeconds.observe({
            method: req.method,
            route,
            status_code: statusCode,
        }, duration);
    });
    next();
}
