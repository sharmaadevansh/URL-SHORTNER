import { linksService } from './links.service.js';
export class LinksController {
    service;
    constructor(service = linksService) {
        this.service = service;
    }
    create = async (req, res, next) => {
        try {
            const link = await this.service.createLink(req.user.id, req.body);
            return res.status(201).json({
                success: true,
                data: link,
            });
        }
        catch (err) {
            next(err);
        }
    };
    list = async (req, res, next) => {
        try {
            const result = await this.service.getLinks(req.user.id, req.query);
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const link = await this.service.getLinkById(req.params.id, req.user.id, req.user?.role);
            return res.status(200).json({
                success: true,
                data: link,
            });
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const link = await this.service.updateLink(req.params.id, req.user.id, req.body, req.user?.role);
            return res.status(200).json({
                success: true,
                data: link,
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const link = await this.service.updateStatus(req.params.id, req.user.id, req.body, req.user?.role);
            return res.status(200).json({
                success: true,
                data: link,
            });
        }
        catch (err) {
            next(err);
        }
    };
    delete = async (req, res, next) => {
        try {
            const result = await this.service.deleteLink(req.params.id, req.user.id, req.user?.role);
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
export const linksController = new LinksController();
