import { analyticsRepository } from './analytics.repository.js';
import { LinkModel } from '../../infrastructure/database/models/Link.js';
import { config } from '../../config/index.js';
export class AnalyticsService {
    repo;
    constructor(repo = analyticsRepository) {
        this.repo = repo;
    }
    async getLinkAnalytics(linkId, ownerId, range = '7d', role) {
        const link = await LinkModel.findById(linkId);
        if (!link) {
            const error = new Error('Link not found');
            error.statusCode = 404;
            throw error;
        }
        if (link.ownerId.toString() !== ownerId && role !== 'admin') {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        const stats = await this.repo.getLinkStats(linkId, range);
        return {
            link: {
                id: link.id,
                shortCode: link.shortCode,
                originalUrl: link.originalUrl,
                title: link.title,
                status: link.status,
                expiresAt: link.expiresAt,
                shortUrl: `${config.publicAppUrl}/${link.shortCode}`,
                createdAt: link.createdAt,
            },
            range,
            ...stats,
        };
    }
    async getAccountOverview(ownerId) {
        const overview = await this.repo.getAccountOverview(ownerId);
        return {
            ...overview,
            recentLinks: overview.recentLinks.map((l) => ({
                ...l.toJSON(),
                shortUrl: `${config.publicAppUrl}/${l.shortCode}`,
            })),
        };
    }
}
export const analyticsService = new AnalyticsService();
