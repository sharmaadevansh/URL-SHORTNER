import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function authenticate(req, res, next) {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    }
    else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required. No access token provided.',
                code: 'UNAUTHORIZED',
            },
        });
    }
    try {
        const decoded = jwt.verify(token, config.jwt.accessSecret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access token has expired',
                    code: 'TOKEN_EXPIRED',
                },
            });
        }
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid or malformed access token',
                code: 'INVALID_TOKEN',
            },
        });
    }
}
