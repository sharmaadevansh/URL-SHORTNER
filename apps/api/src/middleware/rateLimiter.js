import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
export const standardRateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
});
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again after 15 minutes.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
        },
    },
});
export const linkCreateRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 link creations per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Link creation rate limit reached, please slow down.',
            code: 'LINK_CREATE_RATE_LIMIT_EXCEEDED',
        },
    },
});
