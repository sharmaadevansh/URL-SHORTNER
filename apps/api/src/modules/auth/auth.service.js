import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository.js';
import { config } from '../../config/index.js';
import { LinkModel, ClickEventModel } from '../../infrastructure/database/models/index.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
export class AuthService {
    repo;
    constructor(repo = authRepository) {
        this.repo = repo;
    }
    generateTokens(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
            expiresIn: config.jwt.accessExpiry,
        });
        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiry,
        });
        return { accessToken, refreshToken };
    }
    async register(input) {
        const existing = await this.repo.findByEmail(input.email);
        if (existing) {
            const error = new Error('An account with this email already exists');
            error.statusCode = 409;
            error.code = 'EMAIL_ALREADY_EXISTS';
            throw error;
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(input.password, salt);
        const user = await this.repo.createUser({
            name: input.name,
            email: input.email,
            passwordHash,
            role: 'user',
        });
        const tokens = this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: user.toJSON(),
            ...tokens,
        };
    }
    async login(input) {
        const user = await this.repo.findByEmail(input.email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        const tokens = this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: user.toJSON(),
            ...tokens,
        };
    }
    async getCurrentUser(userId) {
        const user = await this.repo.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }
        return user.toJSON();
    }
    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
            const user = await this.repo.findById(decoded.id);
            if (!user) {
                const error = new Error('User no longer exists');
                error.statusCode = 401;
                throw error;
            }
            return this.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });
        }
        catch {
            const error = new Error('Invalid or expired refresh token');
            error.statusCode = 401;
            error.code = 'INVALID_REFRESH_TOKEN';
            throw error;
        }
    }
    async updateProfile(userId, input) {
        if (input.email) {
            const existing = await this.repo.findByEmail(input.email);
            if (existing && existing.id !== userId) {
                const error = new Error('Email is already taken by another account');
                error.statusCode = 409;
                throw error;
            }
        }
        const updated = await this.repo.updateProfile(userId, input);
        if (!updated) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return updated.toJSON();
    }
    async changePassword(userId, input) {
        const user = await this.repo.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
            const error = new Error('Current password is incorrect');
            error.statusCode = 400;
            error.code = 'INVALID_CURRENT_PASSWORD';
            throw error;
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(input.newPassword, salt);
        await this.repo.updatePassword(userId, passwordHash);
    }
    async deleteAccount(userId) {
        // Invalidate caches and delete owned links
        const links = await LinkModel.find({ ownerId: userId });
        for (const link of links) {
            await cacheService.deleteLink(link.shortCode);
            await ClickEventModel.deleteMany({ linkId: link._id });
        }
        await LinkModel.deleteMany({ ownerId: userId });
        await this.repo.deleteUser(userId);
    }
}
export const authService = new AuthService();
