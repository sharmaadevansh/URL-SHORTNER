import { authService } from './auth.service.js';
import { config } from '../../config/index.js';
function getRefreshCookieOptions() {
    const isHttps = config.publicAppUrl.startsWith('https://') ||
        config.apiBaseUrl.startsWith('https://');
    return {
        httpOnly: true,
        secure: isHttps,
        sameSite: (isHttps ? 'none' : 'lax'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
}
export class AuthController {
    service;
    constructor(service = authService) {
        this.service = service;
    }
    register = async (req, res, next) => {
        try {
            const result = await this.service.register(req.body);
            // Set refresh token in HttpOnly cookie
            res.cookie('refresh_token', result.refreshToken, getRefreshCookieOptions());
            return res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (err) {
            next(err);
        }
    };
    login = async (req, res, next) => {
        try {
            const result = await this.service.login(req.body);
            res.cookie('refresh_token', result.refreshToken, getRefreshCookieOptions());
            return res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (err) {
            next(err);
        }
    };
    logout = async (req, res, next) => {
        try {
            const { httpOnly, secure, sameSite } = getRefreshCookieOptions();
            res.clearCookie('refresh_token', { httpOnly, secure, sameSite });
            return res.status(200).json({
                success: true,
                data: { message: 'Logged out successfully' },
            });
        }
        catch (err) {
            next(err);
        }
    };
    me = async (req, res, next) => {
        try {
            const user = await this.service.getCurrentUser(req.user.id);
            return res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (err) {
            next(err);
        }
    };
    refresh = async (req, res, next) => {
        try {
            const token = req.cookies?.refresh_token || req.body?.refreshToken;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'Refresh token not provided', code: 'UNAUTHORIZED' },
                });
            }
            const tokens = await this.service.refresh(token);
            res.cookie('refresh_token', tokens.refreshToken, getRefreshCookieOptions());
            return res.status(200).json({
                success: true,
                data: { accessToken: tokens.accessToken },
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const user = await this.service.updateProfile(req.user.id, req.body);
            return res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (err) {
            next(err);
        }
    };
    changePassword = async (req, res, next) => {
        try {
            await this.service.changePassword(req.user.id, req.body);
            return res.status(200).json({
                success: true,
                data: { message: 'Password updated successfully' },
            });
        }
        catch (err) {
            next(err);
        }
    };
    deleteAccount = async (req, res, next) => {
        try {
            await this.service.deleteAccount(req.user.id);
            const { httpOnly, secure, sameSite } = getRefreshCookieOptions();
            res.clearCookie('refresh_token', { httpOnly, secure, sameSite });
            return res.status(200).json({
                success: true,
                data: { message: 'Account deleted successfully' },
            });
        }
        catch (err) {
            next(err);
        }
    };
}
export const authController = new AuthController();
