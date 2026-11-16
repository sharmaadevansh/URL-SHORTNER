import { Request, Response, NextFunction } from 'express';
import { analyticsService, AnalyticsService } from './analytics.service.js';
import { TimeRange } from '@linkforge/shared';

export class AnalyticsController {
  constructor(private service: AnalyticsService = analyticsService) {}

  public getLinkAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const range = (req.query.range as TimeRange) || '7d';
      const data = await this.service.getLinkAnalytics(
        req.params.id,
        req.user!.id,
        range,
        req.user?.role
      );
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  public getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAccountOverview(req.user!.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const analyticsController = new AnalyticsController();
