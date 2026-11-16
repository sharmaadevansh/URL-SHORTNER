import { Request, Response, NextFunction } from 'express';
import { linksService, LinksService } from './links.service.js';

export class LinksController {
  constructor(private service: LinksService = linksService) {}

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const link = await this.service.createLink(req.user!.id, req.body);
      return res.status(201).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getLinks(req.user!.id, req.query as any);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const link = await this.service.getLinkById(req.params.id, req.user!.id, req.user?.role);
      return res.status(200).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const link = await this.service.updateLink(req.params.id, req.user!.id, req.body, req.user?.role);
      return res.status(200).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const link = await this.service.updateStatus(
        req.params.id,
        req.user!.id,
        req.body,
        req.user?.role
      );
      return res.status(200).json({
        success: true,
        data: link,
      });
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteLink(req.params.id, req.user!.id, req.user?.role);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const linksController = new LinksController();
