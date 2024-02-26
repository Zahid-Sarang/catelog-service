import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { CategoryService } from "./category-service";
import { Category } from "./category-types";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
    }
    async create(req: Request, res: Response, next: NextFunction) {
        // validate request
        const requestValidationError = validationResult(req);
        if (!requestValidationError.isEmpty()) {
            return next(
                createHttpError(
                    400,
                    requestValidationError.array()[0].msg as string,
                ),
            );
        }

        const { name, priceConfiguration, attributes } = req.body as Category;

        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created category`, { id: category._id });

        res.json({ id: category._id });
    }
}
