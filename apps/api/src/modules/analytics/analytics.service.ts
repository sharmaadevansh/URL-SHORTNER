import { analyticsRepository, AnalyticsRepository } from './analytics.repository.js';
import { LinkModel } from '../../infrastructure/database/models/Link.js';
import { TimeRange } from '@linkforge/shared';
import { config } from '../../config/index.js';

export class AnalyticsService {
  constructor(private repo: AnalyticsRepository = analyticsRepository) {}

  public async getLinkAnalytics(linkId: string, ownerId: string, range: TimeRange = '7d', role?: string) {
    const link = await LinkModel.findById(linkId);
    if (!link) {
      const error: any = new Error('Link not found');
      error.statusCode = 404;
      throw error;
    }

    if (link.ownerId.toString() !== ownerId && role !== 'admin') {
      const error: any = new Error('Forbidden');
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

  public async getAccountOverview(ownerId: string) {
    const overview = await this.repo.getAccountOverview(ownerId);
    return {
      ...overview,
      recentLinks: overview.recentLinks.map((l: any) => ({
        ...l.toJSON(),
        shortUrl: `${config.publicAppUrl}/${l.shortCode}`,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
