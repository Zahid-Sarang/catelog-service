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
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
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

        res.status(201).json({ id: category._id });
    };

    getList = async (req: Request, res: Response) => {
        const categories = await this.categoryService.getAll();
        res.json(categories);
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { id: categoryId } = req.params;
        if (!categoryId) {
            return next(createHttpError(400, "Invalid Params!"));
        }
        const category = await this.categoryService.getById(categoryId);

        res.json(category);
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const requestValidationError = validationResult(req);
        if (!requestValidationError.isEmpty()) {
            return next(
                createHttpError(
                    400,
                    requestValidationError.array()[0].msg as string,
                ),
            );
        }
        const { id: categoryId } = req.params;
        if (!categoryId) {
            return next(createHttpError(400, "Invalid Params!"));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const updatedCategory = await this.categoryService.updateById(
            categoryId,
            { name, priceConfiguration, attributes },
        );

        res.json(updatedCategory);
    };
}
