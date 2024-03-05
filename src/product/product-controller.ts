import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { CreateProductRequest, Product } from "./product-types";
import { FileStorage } from "../common/types/storage";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
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

        // upload image to s3 bucket
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            fileName: imageName,
            fileData: image.data.buffer,
        });

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
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        );
        this.logger.info(`Created Product`, { id: newProduct._id });

        res.json({ id: newProduct.id });
    };
}
