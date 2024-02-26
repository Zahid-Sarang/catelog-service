import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { CreateProductRequest, Product } from "./product-types";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
    ) {}
    create = async (
        req: CreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            // todo: upload image
            image: "image.jpg",
        };

        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        );
        this.logger.info(`Created Product`, { id: newProduct._id });

        res.json({ id: newProduct.id });
    };
}
