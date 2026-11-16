import { Redis } from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../../observability/logger.js';
import { cacheOperationsTotal } from '../../observability/metrics.js';

export interface CachedLinkRecord {
  linkId: string;
  originalUrl: string;
  status: 'active' | 'disabled';
  expiresAt: string | null;
}

// In-memory fallback map if Redis is offline
const memoryFallback = new Map<string, { value: string; expiresAt: number }>();

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
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

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        logger.warn({ error: err.message }, 'Redis connection warning - falling back to memory cache');
      });

      this.client.connect().catch((err: any) => {
        logger.warn({ error: err.message }, 'Initial Redis connect failed - using memory fallback');
      });
    } catch (err: any) {
      logger.warn({ error: err.message }, 'Redis init exception - using memory fallback');
    }
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async getLink(shortCode: string): Promise<CachedLinkRecord | null> {
    const key = `link:${shortCode}`;

    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        if (data) {
          cacheOperationsTotal.inc({ operation: 'get', result: 'hit' });
          return JSON.parse(data) as CachedLinkRecord;
        }
        cacheOperationsTotal.inc({ operation: 'get', result: 'miss' });
        return null;
      } catch (err) {
        logger.warn({ error: err }, 'Redis get error - trying memory fallback');
      }
    }

    // Memory fallback check
    const entry = memoryFallback.get(key);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        cacheOperationsTotal.inc({ operation: 'get', result: 'hit_memory' });
        return JSON.parse(entry.value) as CachedLinkRecord;
      } else {
        memoryFallback.delete(key);
      }
    }

    cacheOperationsTotal.inc({ operation: 'get', result: 'miss' });
    return null;
  }

  public async setLink(shortCode: string, record: CachedLinkRecord, ttlSeconds = 3600): Promise<void> {
    const key = `link:${shortCode}`;
    const serialized = JSON.stringify(record);

    // Enforce expiry constraint if record expires earlier than TTL
    let finalTtl = ttlSeconds;
    if (record.expiresAt) {
      const remainingSeconds = Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000);
      if (remainingSeconds <= 0) return; // expired already, do not cache
      finalTtl = Math.min(ttlSeconds, remainingSeconds);
    }

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, serialized, 'EX', finalTtl);
        cacheOperationsTotal.inc({ operation: 'set', result: 'success' });
        return;
      } catch (err) {
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

  public async deleteLink(shortCode: string): Promise<void> {
    const key = `link:${shortCode}`;
    memoryFallback.delete(key);

    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        cacheOperationsTotal.inc({ operation: 'del', result: 'success' });
      } catch (err) {
        logger.warn({ error: err }, 'Redis del error');
      }
    }
  }

  public async quit(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }
}

export const cacheService = new CacheService();
