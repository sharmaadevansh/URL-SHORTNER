import { linksRepository, LinksRepository } from './links.repository.js';
import { generateShortCode } from './codeGenerator.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { ClickEventModel } from '../../infrastructure/database/models/ClickEvent.js';
import { config } from '../../config/index.js';
import {
  CreateLinkInput,
  UpdateLinkInput,
  UpdateLinkStatusInput,
  LinkQueryParams,
} from '@linkforge/shared';

export class LinksService {
  constructor(private repo: LinksRepository = linksRepository) {}

  public formatLink(linkDoc: any) {
    const json = linkDoc.toJSON ? linkDoc.toJSON() : { ...linkDoc };
    const shortUrl = `${config.publicAppUrl}/${json.shortCode}`;
    return {
      ...json,
      shortUrl,
    };
  }

  public async createLink(ownerId: string, input: CreateLinkInput) {
    let shortCode = input.customAlias?.trim();

    if (shortCode) {
      const existing = await this.repo.findByShortCode(shortCode);
      if (existing) {
        const error: any = new Error('Custom alias is already in use');
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
        await cacheService.setLink(
          shortCode,
          {
            linkId: link.id,
            originalUrl: link.originalUrl,
            status: link.status,
            expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
          },
          3600
        );

        return this.formatLink(link);
      } catch (err: any) {
        // Mongo duplicate key error code 11000
        if (err.code === 11000) {
          if (input.customAlias) {
            const error: any = new Error('Custom alias is already in use');
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

    const error: any = new Error('Failed to generate a unique short code. Please try again.');
    error.statusCode = 500;
    throw error;
  }

  public async getLinks(ownerId: string, params: LinkQueryParams) {
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

  public async getLinkById(id: string, ownerId: string, role?: string) {
    const link = await this.repo.findById(id);
    if (!link) {
      const error: any = new Error('Link not found');
      error.statusCode = 404;
      error.code = 'LINK_NOT_FOUND';
      throw error;
    }

    if (link.ownerId.toString() !== ownerId && role !== 'admin') {
      const error: any = new Error('Forbidden: you do not have permission to access this link');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return this.formatLink(link);
  }

  public async updateLink(id: string, ownerId: string, input: UpdateLinkInput, role?: string) {
    const link = await this.repo.findById(id);
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

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.originalUrl !== undefined) updateData.originalUrl = input.originalUrl;
    if (input.expiresAt !== undefined) {
      updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }

    const updated = await this.repo.update(id, updateData);

    // Invalidate Redis cache
    await cacheService.deleteLink(link.shortCode);

    return this.formatLink(updated);
  }

  public async updateStatus(id: string, ownerId: string, input: UpdateLinkStatusInput, role?: string) {
    const link = await this.repo.findById(id);
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

    const updated = await this.repo.update(id, { status: input.status as any });

    // Invalidate Redis cache
    await cacheService.deleteLink(link.shortCode);

    return this.formatLink(updated);
  }

  public async deleteLink(id: string, ownerId: string, role?: string) {
    const link = await this.repo.findById(id);
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

    await this.repo.delete(id);
    await cacheService.deleteLink(link.shortCode);
    await ClickEventModel.deleteMany({ linkId: link._id });

    return { message: 'Link deleted successfully' };
  }
}

export const linksService = new LinksService();
