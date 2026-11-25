import mongoose from 'mongoose';
import { LinkModel } from '../../infrastructure/database/models/Link.js';
export class LinksRepository {
    async create(data) {
        return LinkModel.create({
            ownerId: new mongoose.Types.ObjectId(data.ownerId),
            shortCode: data.shortCode,
            originalUrl: data.originalUrl,
            title: data.title || '',
            expiresAt: data.expiresAt || null,
            status: 'active',
            totalClicks: 0,
        });
    }
    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return null;
        return LinkModel.findById(id);
    }
    async findByShortCode(shortCode) {
        return LinkModel.findOne({ shortCode });
    }
    async findUserLinks(ownerId, params) {
        const query = {
            ownerId: new mongoose.Types.ObjectId(ownerId),
        };
        const now = new Date();
        if (params.status === 'active') {
            query.status = 'active';
            query.$or = [{ expiresAt: null }, { expiresAt: { $gt: now } }];
        }
        else if (params.status === 'disabled') {
            query.status = 'disabled';
        }
        else if (params.status === 'expired') {
            query.expiresAt = { $lte: now };
        }
        if (params.search && params.search.trim()) {
            const searchRegex = new RegExp(params.search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { shortCode: searchRegex },
                { originalUrl: searchRegex },
            ];
        }
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            LinkModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            LinkModel.countDocuments(query),
        ]);
        return { items, total };
    }
    async update(id, updateData) {
        return LinkModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    async delete(id) {
        return LinkModel.findByIdAndDelete(id);
    }
    async countByOwner(ownerId) {
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        const now = new Date();
        const [total, active, clicksAgg] = await Promise.all([
            LinkModel.countDocuments({ ownerId: ownerObjectId }),
            LinkModel.countDocuments({
                ownerId: ownerObjectId,
                status: 'active',
                $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            }),
            LinkModel.aggregate([
                { $match: { ownerId: ownerObjectId } },
                { $group: { _id: null, totalClicks: { $sum: '$totalClicks' } } },
            ]),
        ]);
        return {
            total,
            active,
            totalClicks: clicksAgg[0]?.totalClicks || 0,
        };
    }
}
export const linksRepository = new LinksRepository();
