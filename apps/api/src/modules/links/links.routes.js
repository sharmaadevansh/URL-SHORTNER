import { Router } from 'express';
import { linksController } from './links.controller.js';
import { analyticsController } from '../analytics/analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { linkCreateRateLimiter } from '../../middleware/rateLimiter.js';
import { createLinkSchema, updateLinkSchema, updateLinkStatusSchema, linkQuerySchema, } from '@linkforge/shared';
const router = Router();
// All link management routes require authentication
router.use(authenticate);
router.post('/', linkCreateRateLimiter, validateBody(createLinkSchema), linksController.create);
router.get('/', validateQuery(linkQuerySchema), linksController.list);
router.get('/:id', linksController.getById);
router.get('/:id/analytics', analyticsController.getLinkAnalytics);
router.patch('/:id', validateBody(updateLinkSchema), linksController.update);
router.patch('/:id/status', validateBody(updateLinkStatusSchema), linksController.updateStatus);
router.delete('/:id', linksController.delete);
export const linksRouter = router;
