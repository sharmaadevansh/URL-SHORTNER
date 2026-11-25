import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { config } from '../../config/index.js';
import { logger } from '../../observability/logger.js';
import { ClickEventModel, LinkModel } from '../database/models/index.js';
import mongoose from 'mongoose';
export const localClickEventEmitter = new EventEmitter();
class EventPublisher {
    client = null;
    isConnected = false;
    constructor() {
        this.init();
    }
    init() {
        // Set up local fallback listener so click events are always processed asynchronously
        localClickEventEmitter.on('click_event', async (payload) => {
            try {
                await this.persistClickEventDirectly(payload);
            }
            catch (err) {
                logger.error({ error: err }, 'Error in local event consumer');
            }
        });
        if (!config.redisUrl || config.disableRedisQueue) {
            logger.info('Redis analytics queue disabled/unconfigured - using in-process async click persistence');
            return;
        }
        try {
            this.client = new Redis(config.redisUrl, {
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => {
                    if (times > 3) {
                        return null;
                    }
                    return Math.min(times * 100, 1000);
                },
                enableOfflineQueue: false,
                lazyConnect: true,
            });
            this.client.on('connect', () => {
                this.isConnected = true;
            });
            this.client.on('error', () => {
                this.isConnected = false;
            });
            this.client.connect().catch(() => {
                this.isConnected = false;
            });
        }
        catch {
            this.isConnected = false;
        }
    }
    async publishClickEvent(event) {
        const serialized = JSON.stringify(event);
        if (this.isConnected && this.client) {
            try {
                await this.client.lpush('linkforge:queue:clicks', serialized);
                logger.debug({ shortCode: event.shortCode }, 'Pushed click event to Redis queue');
                return;
            }
            catch (err) {
                logger.warn({ error: err }, 'Failed to publish to Redis queue, using in-process emitter');
            }
        }
        // Direct asynchronous processing via setImmediate so redirect latency is untouched
        setImmediate(() => {
            localClickEventEmitter.emit('click_event', event);
        });
    }
    async persistClickEventDirectly(payload) {
        try {
            await ClickEventModel.create({
                linkId: new mongoose.Types.ObjectId(payload.linkId),
                shortCode: payload.shortCode,
                occurredAt: new Date(payload.occurredAt),
                referrerHost: payload.referrerHost,
                deviceType: payload.deviceType,
                browserFamily: payload.browserFamily,
                countryCode: payload.countryCode,
            });
            await LinkModel.findByIdAndUpdate(payload.linkId, {
                $inc: { totalClicks: 1 },
            });
        }
        catch (err) {
            logger.error({ error: err, payload }, 'Failed to persist click event directly');
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
export const eventPublisher = new EventPublisher();
