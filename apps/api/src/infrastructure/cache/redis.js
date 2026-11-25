import { Redis } from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../../observability/logger.js';
import { cacheOperationsTotal } from '../../observability/metrics.js';
// In-memory fallback map if Redis is offline
const memoryFallback = new Map();
class CacheService {
    client = null;
    isConnected = false;
    constructor() {
        this.initClient();
    }
    initClient() {
        if (!config.redisUrl) {
            logger.info('REDIS_URL not configured - using in-memory cache');
            return;
        }
        try {
            this.client = new Redis(config.redisUrl, {
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => {
                    if (times > 3) {
                        return null; // stop reconnecting indefinitely if server is down
                    }
                    return Math.min(times * 100, 1000);
                },
                enableOfflineQueue: false,
                lazyConnect: true,
            });
            this.client.on('connect', () => {
                this.isConnected = true;
                logger.info('Connected to Redis');
            });
            this.client.on('error', (err) => {
                this.isConnected = false;
                logger.warn({ error: err.message }, 'Redis connection warning - falling back to memory cache');
            });
            this.client.connect().catch((err) => {
                logger.warn({ error: err.message }, 'Initial Redis connect failed - using memory fallback');
            });
        }
        catch (err) {
            logger.warn({ error: err.message }, 'Redis init exception - using memory fallback');
        }
    }
    isHealthy() {
        return this.isConnected;
    }
    async getLink(shortCode) {
        const key = `link:${shortCode}`;
        if (this.isConnected && this.client) {
            try {
                const data = await this.client.get(key);
                if (data) {
                    cacheOperationsTotal.inc({ operation: 'get', result: 'hit' });
                    return JSON.parse(data);
                }
                cacheOperationsTotal.inc({ operation: 'get', result: 'miss' });
                return null;
            }
            catch (err) {
                logger.warn({ error: err }, 'Redis get error - trying memory fallback');
            }
        }
        // Memory fallback check
        const entry = memoryFallback.get(key);
        if (entry) {
            if (entry.expiresAt > Date.now()) {
                cacheOperationsTotal.inc({ operation: 'get', result: 'hit_memory' });
                return JSON.parse(entry.value);
            }
            else {
                memoryFallback.delete(key);
            }
        }
        cacheOperationsTotal.inc({ operation: 'get', result: 'miss' });
        return null;
    }
    async setLink(shortCode, record, ttlSeconds = 3600) {
        const key = `link:${shortCode}`;
        const serialized = JSON.stringify(record);
        // Enforce expiry constraint if record expires earlier than TTL
        let finalTtl = ttlSeconds;
        if (record.expiresAt) {
            const remainingSeconds = Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000);
            if (remainingSeconds <= 0)
                return; // expired already, do not cache
            finalTtl = Math.min(ttlSeconds, remainingSeconds);
        }
        if (this.isConnected && this.client) {
            try {
                await this.client.set(key, serialized, 'EX', finalTtl);
                cacheOperationsTotal.inc({ operation: 'set', result: 'success' });
                return;
            }
            catch (err) {
                logger.warn({ error: err }, 'Redis set error - falling back to memory');
            }
        }
        // Memory fallback
        memoryFallback.set(key, {
            value: serialized,
            expiresAt: Date.now() + finalTtl * 1000,
        });
        cacheOperationsTotal.inc({ operation: 'set', result: 'success_memory' });
    }
    async deleteLink(shortCode) {
        const key = `link:${shortCode}`;
        memoryFallback.delete(key);
        if (this.isConnected && this.client) {
            try {
                await this.client.del(key);
                cacheOperationsTotal.inc({ operation: 'del', result: 'success' });
            }
            catch (err) {
                logger.warn({ error: err }, 'Redis del error');
            }
        }
    }
    async quit() {
        if (this.client) {
            try {
                await this.client.quit();
            }
            catch { }
        }
    }
}
export const cacheService = new CacheService();
