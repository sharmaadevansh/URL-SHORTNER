import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service.js';
import { config } from '../../config/index.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body);

      // Set refresh token in HttpOnly cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body);

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getCurrentUser(req.user!.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token not provided', code: 'UNAUTHORIZED' },
        });
      }

      const tokens = await this.service.refresh(token);

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (err) {
      next(err);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.updateProfile(req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.changePassword(req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        data: { message: 'Password updated successfully' },
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteAccount(req.user!.id);
      res.clearCookie('refresh_token');
      return res.status(200).json({
        success: true,
        data: { message: 'Account deleted successfully' },
      });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
