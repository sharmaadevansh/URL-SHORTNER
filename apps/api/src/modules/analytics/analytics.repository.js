import mongoose from 'mongoose';
import { ClickEventModel } from '../../infrastructure/database/models/ClickEvent.js';
import { LinkModel } from '../../infrastructure/database/models/Link.js';
export class AnalyticsRepository {
    async getLinkStats(linkId, range = '7d') {
        const objectId = new mongoose.Types.ObjectId(linkId);
        const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [totalClicksCount, todayClicksCount, rawTimeSeries, rawReferrers, rawDevices, rawBrowsers] = await Promise.all([
            ClickEventModel.countDocuments({ linkId: objectId }),
            ClickEventModel.countDocuments({ linkId: objectId, occurredAt: { $gte: todayStart } }),
            // Time series aggregation by day
            ClickEventModel.aggregate([
                { $match: { linkId: objectId, occurredAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
                        clicks: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // Top referrers
            ClickEventModel.aggregate([
                { $match: { linkId: objectId, occurredAt: { $gte: startDate } } },
                { $group: { _id: '$referrerHost', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            // Device breakdown
            ClickEventModel.aggregate([
                { $match: { linkId: objectId, occurredAt: { $gte: startDate } } },
                { $group: { _id: '$deviceType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            // Browser breakdown
            ClickEventModel.aggregate([
                { $match: { linkId: objectId, occurredAt: { $gte: startDate } } },
                { $group: { _id: '$browserFamily', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        // Fill missing days in the time series with 0 clicks
        const dateMap = new Map();
        for (const item of rawTimeSeries) {
            dateMap.set(item._id, item.clicks);
        }
        const timeSeries = [];
        const current = new Date(startDate);
        const now = new Date();
        while (current <= now) {
            const dateStr = current.toISOString().slice(0, 10);
            timeSeries.push({
                date: dateStr,
                clicks: dateMap.get(dateStr) || 0,
            });
            current.setDate(current.getDate() + 1);
        }
        const rangeTotalClicks = rawTimeSeries.reduce((sum, item) => sum + item.clicks, 0) || 1;
        const referrers = rawReferrers.map((item) => ({
            name: item._id || 'Direct / None',
            count: item.count,
            percentage: Math.round((item.count / rangeTotalClicks) * 100),
        }));
        const devices = rawDevices.map((item) => ({
            name: item._id || 'Desktop',
            count: item.count,
            percentage: Math.round((item.count / rangeTotalClicks) * 100),
        }));
        const browsers = rawBrowsers.map((item) => ({
            name: item._id || 'Other',
            count: item.count,
            percentage: Math.round((item.count / rangeTotalClicks) * 100),
        }));
        return {
            totalClicks: totalClicksCount,
            todayClicks: todayClicksCount,
            timeSeries,
            referrers,
            devices,
            browsers,
        };
    }
    async getAccountOverview(ownerId) {
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        const now = new Date();
        const [totalLinks, activeLinks, clickSum, recentLinks] = await Promise.all([
            LinkModel.countDocuments({ ownerId: ownerObjectId }),
            LinkModel.countDocuments({
                ownerId: ownerObjectId,
                status: 'active',
                $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            }),
            LinkModel.aggregate([
                { $match: { ownerId: ownerObjectId } },
                { $group: { _id: null, total: { $sum: '$totalClicks' } } },
            ]),
            LinkModel.find({ ownerId: ownerObjectId }).sort({ createdAt: -1 }).limit(5),
        ]);
        return {
            totalLinks,
            activeLinks,
            totalClicks: clickSum[0]?.total || 0,
            recentLinks,
        };
    }
}
export const analyticsRepository = new AnalyticsRepository();
