import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository, AuthRepository } from './auth.repository.js';
import { config } from '../../config/index.js';
import { LinkModel, ClickEventModel } from '../../infrastructure/database/models/index.js';
import { cacheService } from '../../infrastructure/cache/redis.js';
import { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '@linkforge/shared';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  public generateTokens(user: { id: string; email: string; role: 'user' | 'admin' }): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as any,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  public async register(input: RegisterInput) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      const error: any = new Error('An account with this email already exists');
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

  public async login(input: LoginInput) {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      const error: any = new Error('Invalid email or password');
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

  public async getCurrentUser(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user.toJSON();
  }

  public async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        role: 'user' | 'admin';
      };

      const user = await this.repo.findById(decoded.id);
      if (!user) {
        const error: any = new Error('User no longer exists');
        error.statusCode = 401;
        throw error;
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }
  }

  public async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.email) {
      const existing = await this.repo.findByEmail(input.email);
      if (existing && existing.id !== userId) {
        const error: any = new Error('Email is already taken by another account');
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await this.repo.updateProfile(userId, input);
    if (!updated) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return updated.toJSON();
  }

  public async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.repo.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      const error: any = new Error('Current password is incorrect');
      error.statusCode = 400;
      error.code = 'INVALID_CURRENT_PASSWORD';
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);
    await this.repo.updatePassword(userId, passwordHash);
  }

  public async deleteAccount(userId: string) {
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
