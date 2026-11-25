import { analyticsService } from './analytics.service.js';
export class AnalyticsController {
    service;
    constructor(service = analyticsService) {
        this.service = service;
    }
    getLinkAnalytics = async (req, res, next) => {
        try {
            const range = req.query.range || '7d';
            const data = await this.service.getLinkAnalytics(req.params.id, req.user.id, range, req.user?.role);
            return res.status(200).json({
                success: true,
                data,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getOverview = async (req, res, next) => {
        try {
            const data = await this.service.getAccountOverview(req.user.id);
            return res.status(200).json({
                success: true,
                data,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
export const analyticsController = new AnalyticsController();
