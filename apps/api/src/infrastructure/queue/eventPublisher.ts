import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { config } from '../../config/index.js';
import { logger } from '../../observability/logger.js';
import { ClickEventModel, LinkModel } from '../database/models/index.js';
import mongoose from 'mongoose';

export interface ClickQueuePayload {
  linkId: string;
  shortCode: string;
  occurredAt: string;
  referrerHost: string | null;
  deviceType: string | null;
  browserFamily: string | null;
  countryCode: string | null;
}

export const localClickEventEmitter = new EventEmitter();

class EventPublisher {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
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
    } catch {
      this.isConnected = false;
    }

    // Set up local fallback listener so click events are always processed asynchronously
    localClickEventEmitter.on('click_event', async (payload: ClickQueuePayload) => {
      try {
        await this.persistClickEventDirectly(payload);
      } catch (err) {
        logger.error({ error: err }, 'Error in local event consumer');
      }
    });
  }

  public async publishClickEvent(event: ClickQueuePayload): Promise<void> {
    const serialized = JSON.stringify(event);

    if (this.isConnected && this.client) {
      try {
        await this.client.lpush('linkforge:queue:clicks', serialized);
        logger.debug({ shortCode: event.shortCode }, 'Pushed click event to Redis queue');
        return;
      } catch (err) {
        logger.warn({ error: err }, 'Failed to publish to Redis queue, using in-process emitter');
      }
    }

    // Direct asynchronous processing via setImmediate so redirect latency is untouched
    setImmediate(() => {
      localClickEventEmitter.emit('click_event', event);
    });
  }

  public async persistClickEventDirectly(payload: ClickQueuePayload): Promise<void> {
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
    } catch (err) {
      logger.error({ error: err, payload }, 'Failed to persist click event directly');
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

export const eventPublisher = new EventPublisher();
