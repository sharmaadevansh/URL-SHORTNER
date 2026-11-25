import { UAParser } from 'ua-parser-js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { LinkModel } from '../../infrastructure/database/models/Link.js';
import { eventPublisher } from '../../infrastructure/queue/eventPublisher.js';
import { redirectsTotal } from '../../observability/metrics.js';
import { logger } from '../../observability/logger.js';
export class RedirectService {
    async resolve(shortCode) {
        const now = Date.now();
        // 1. Try Cache
        const cached = await cacheService.getLink(shortCode);
        if (cached) {
            if (cached.status !== 'active') {
                redirectsTotal.inc({ status: 'disabled', cache_hit: 'true' });
                return { status: 'disabled', shortCode };
            }
            if (cached.expiresAt && new Date(cached.expiresAt).getTime() <= now) {
                redirectsTotal.inc({ status: 'expired', cache_hit: 'true' });
                return { status: 'expired', shortCode };
            }
            redirectsTotal.inc({ status: 'success', cache_hit: 'true' });
            return {
                status: 'found',
                destinationUrl: cached.originalUrl,
                shortCode,
            };
        }
        // 2. Fallback to MongoDB
        const link = await LinkModel.findOne({ shortCode });
        if (!link) {
            redirectsTotal.inc({ status: 'not_found', cache_hit: 'false' });
            return { status: 'not_found', shortCode };
        }
        if (link.status !== 'active') {
            redirectsTotal.inc({ status: 'disabled', cache_hit: 'false' });
            return { status: 'disabled', shortCode };
        }
        if (link.expiresAt && link.expiresAt.getTime() <= now) {
            redirectsTotal.inc({ status: 'expired', cache_hit: 'false' });
            return { status: 'expired', shortCode };
        }
        // Pre-populate cache
        const cacheRecord = {
            linkId: link.id,
            originalUrl: link.originalUrl,
            status: link.status,
            expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        };
        await cacheService.setLink(shortCode, cacheRecord, 3600);
        redirectsTotal.inc({ status: 'success', cache_hit: 'false' });
        return {
            status: 'found',
            destinationUrl: link.originalUrl,
            shortCode,
        };
    }
    recordClick(linkIdOrCode, userAgentHeader, refererHeader) {
        // Non-blocking asynchronous event publishing
        setImmediate(async () => {
            try {
                let linkId = linkIdOrCode;
                let shortCode = linkIdOrCode;
                const cached = await cacheService.getLink(linkIdOrCode);
                if (cached) {
                    linkId = cached.linkId;
                }
                else {
                    const link = await LinkModel.findOne({ shortCode: linkIdOrCode }).select('_id');
                    if (link) {
                        linkId = link._id.toString();
                    }
                }
                // Parse user-agent
                let deviceType = 'Desktop';
                let browserFamily = 'Other';
                if (userAgentHeader) {
                    const parser = new UAParser(userAgentHeader);
                    const device = parser.getDevice();
                    const browser = parser.getBrowser();
                    deviceType = device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : 'Desktop';
                    browserFamily = browser.name || 'Other';
                }
                // Parse referrer host
                let referrerHost = null;
                if (refererHeader) {
                    try {
                        const parsed = new URL(refererHeader);
                        referrerHost = parsed.hostname;
                    }
                    catch {
                        referrerHost = 'Direct';
                    }
                }
                else {
                    referrerHost = 'Direct';
                }
                await eventPublisher.publishClickEvent({
                    linkId,
                    shortCode,
                    occurredAt: new Date().toISOString(),
                    referrerHost,
                    deviceType,
                    browserFamily,
                    countryCode: null,
                });
            }
            catch (err) {
                logger.error({ error: err }, 'Failed to record click in background');
            }
        });
    }
}
export const redirectService = new RedirectService();
