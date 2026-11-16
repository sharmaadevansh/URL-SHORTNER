import { Request, Response, NextFunction } from 'express';
import { redirectService, RedirectService } from './redirect.service.js';
import { RESERVED_SLUGS } from '@linkforge/shared';

export class RedirectController {
  constructor(private service: RedirectService = redirectService) {}

  public handleRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.params.code;

      if (!code || RESERVED_SLUGS.includes(code.toLowerCase() as any)) {
        return next();
      }

      const result = await this.service.resolve(code);

      if (result.status === 'not_found' || result.status === 'disabled') {
        if (req.accepts('html')) {
          return res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>Link Not Found - LinkForge</title>
                <style>
                  body { font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; color: #18181b; }
                  .card { text-align: center; max-width: 480px; padding: 2.5rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                  h1 { font-size: 3rem; margin: 0 0 1rem; color: #a1a1aa; }
                  p { color: #52525b; line-height: 1.5; margin-bottom: 2rem; }
                  a { display: inline-block; background: #4f6ef7; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>404</h1>
                  <h2>This link doesn't exist</h2>
                  <p>The short link <strong>${code}</strong> is not valid. It may have been deleted, disabled, or never created.</p>
                  <a href="/">Go to LinkForge</a>
                </div>
              </body>
            </html>
          `);
        }
        return res.status(404).json({
          success: false,
          error: { message: 'Link not found or disabled', code: 'LINK_NOT_FOUND' },
        });
      }

      if (result.status === 'expired') {
        if (req.accepts('html')) {
          return res.status(410).send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>Link Expired - LinkForge</title>
                <style>
                  body { font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; color: #18181b; }
                  .card { text-align: center; max-width: 480px; padding: 2.5rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                  h1 { font-size: 3rem; margin: 0 0 1rem; color: #ef4444; }
                  p { color: #52525b; line-height: 1.5; margin-bottom: 2rem; }
                  a { display: inline-block; background: #4f6ef7; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>410</h1>
                  <h2>This link has expired</h2>
                  <p>The short link <strong>${code}</strong> has reached its expiration date and is no longer available.</p>
                  <a href="/">Go to LinkForge</a>
                </div>
              </body>
            </html>
          `);
        }
        return res.status(410).json({
          success: false,
          error: { message: 'This short link has expired', code: 'LINK_EXPIRED' },
        });
      }

      // Record click asynchronously without blocking redirect
      this.service.recordClick(
        code,
        req.headers['user-agent'],
        (req.headers['referer'] || req.headers['referrer']) as string
      );

      // Return 302 Found redirect
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.redirect(302, result.destinationUrl!);
    } catch (err) {
      next(err);
    }
  };
}

export const redirectController = new RedirectController();
