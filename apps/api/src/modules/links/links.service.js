import { linksRepository } from './links.repository.js';
import { generateShortCode } from './codeGenerator.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { ClickEventModel } from '../../infrastructure/database/models/ClickEvent.js';
import { config } from '../../config/index.js';
export class LinksService {
    repo;
    constructor(repo = linksRepository) {
        this.repo = repo;
    }
    formatLink(linkDoc) {
        const json = linkDoc.toJSON ? linkDoc.toJSON() : { ...linkDoc };
        const shortUrl = `${config.publicAppUrl}/${json.shortCode}`;
        return {
            ...json,
            shortUrl,
        };
    }
    async createLink(ownerId, input) {
        let shortCode = input.customAlias?.trim();
        if (shortCode) {
            const existing = await this.repo.findByShortCode(shortCode);
            if (existing) {
                const error = new Error('Custom alias is already in use');
                error.statusCode = 409;
                error.code = 'ALIAS_ALREADY_EXISTS';
                throw error;
            }
        }
        const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
            if (!shortCode) {
                shortCode = generateShortCode();
            }
            try {
                const link = await this.repo.create({
                    ownerId,
                    shortCode,
                    originalUrl: input.originalUrl,
                    title: input.title,
                    expiresAt,
                });
                // Pre-warm cache for the newly created link
                await cacheService.setLink(shortCode, {
                    linkId: link.id,
                    originalUrl: link.originalUrl,
                    status: link.status,
                    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
                }, 3600);
                return this.formatLink(link);
            }
            catch (err) {
                // Mongo duplicate key error code 11000
                if (err.code === 11000) {
                    if (input.customAlias) {
                        const error = new Error('Custom alias is already in use');
                        error.statusCode = 409;
                        error.code = 'ALIAS_ALREADY_EXISTS';
                        throw error;
                    }
                    // Collision on random generated code: retry with new code
                    shortCode = undefined;
                    attempts++;
                    continue;
                }
                throw err;
            }
        }
        const error = new Error('Failed to generate a unique short code. Please try again.');
        error.statusCode = 500;
        throw error;
    }
    async getLinks(ownerId, params) {
        const { items, total } = await this.repo.findUserLinks(ownerId, params);
        const limit = params.limit || 10;
        const page = params.page || 1;
        return {
            items: items.map((l) => this.formatLink(l)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getLinkById(id, ownerId, role) {
        const link = await this.repo.findById(id);
        if (!link) {
            const error = new Error('Link not found');
            error.statusCode = 404;
            error.code = 'LINK_NOT_FOUND';
            throw error;
        }
        if (link.ownerId.toString() !== ownerId && role !== 'admin') {
            const error = new Error('Forbidden: you do not have permission to access this link');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        return this.formatLink(link);
    }
    async updateLink(id, ownerId, input, role) {
        const link = await this.repo.findById(id);
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
        const updateData = {};
        if (input.title !== undefined)
            updateData.title = input.title;
        if (input.originalUrl !== undefined)
            updateData.originalUrl = input.originalUrl;
        if (input.expiresAt !== undefined) {
            updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
        }
        const updated = await this.repo.update(id, updateData);
        // Invalidate Redis cache
        await cacheService.deleteLink(link.shortCode);
        return this.formatLink(updated);
    }
    async updateStatus(id, ownerId, input, role) {
        const link = await this.repo.findById(id);
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
        const updated = await this.repo.update(id, { status: input.status });
        // Invalidate Redis cache
        await cacheService.deleteLink(link.shortCode);
        return this.formatLink(updated);
    }
    async deleteLink(id, ownerId, role) {
        const link = await this.repo.findById(id);
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
        await this.repo.delete(id);
        await cacheService.deleteLink(link.shortCode);
        await ClickEventModel.deleteMany({ linkId: link._id });
        return { message: 'Link deleted successfully' };
    }
}
export const linksService = new LinksService();
