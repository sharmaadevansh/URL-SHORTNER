import { ZodError } from 'zod';
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof ZodError || err?.name === 'ZodError' || Array.isArray(err?.issues)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: (err.errors || err.issues || []).map((e) => ({
                            path: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                });
            }
            next(err);
        }
    };
}
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (err) {
            if (err instanceof ZodError || err?.name === 'ZodError' || Array.isArray(err?.issues)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid query parameters',
                        code: 'QUERY_VALIDATION_ERROR',
                        details: (err.errors || err.issues || []).map((e) => ({
                            path: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                });
            }
            next(err);
        }
    };
}
