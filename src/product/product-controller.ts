import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import config from "config";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import {
    ProductRequest,
    Product,
    Filter,
    ProductEvents,
} from "./product-types";
import { FileStorage } from "../common/types/storage";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import { MessageProducerBroker } from "../common/types/broker";
import { mapToObject } from "../utils";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
        private broker: MessageProducerBroker,
    ) {}
    create = async (req: ProductRequest, res: Response, next: NextFunction) => {
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

        // Send product to kafka.

        await this.broker.sendMessage(
            config.get("topic.productTopic"),
            JSON.stringify({
                event_type: ProductEvents.PRODUCT_CREATE,
                data: {
                    _id: newProduct._id,
                    priceConfiguration: mapToObject(
                        newProduct.priceConfiguration as unknown as Map<
                            string,
                            unknown
                        >,
                    ),
                },
            }),
        );

        res.json({ id: newProduct._id });
    };

    update = async (req: ProductRequest, res: Response, next: NextFunction) => {
        // validate input
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;

        const product = await this.productService.getProduct(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (product.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;
        if (req.files?.image) {
            oldImage = product.image;
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                fileName: imageName,
                fileData: image.data.buffer,
            });
            await this.storage.delete(oldImage);
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

        const updateProductData = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : (oldImage as string),
        };

        const updatedProduct = await this.productService.updateProduct(
            productId,
            updateProductData,
        );

        // Send product to kafka.
        await this.broker.sendMessage(
            config.get("topic.productTopic"),
            JSON.stringify({
                event_type: ProductEvents.PRODUCT_UPDATE,
                data: {
                    _id: updatedProduct._id,
                    priceConfiguration: mapToObject(
                        updatedProduct.priceConfiguration as unknown as Map<
                            string,
                            unknown
                        >,
                    ),
                },
            }),
        );

        this.logger.info("Product has been updated", {
            id: updatedProduct._id,
        });
        res.json(updatedProduct);
    };

    getList = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish } = req.query;
        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) filters.tenantId = tenantId as string;

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: req.query.currentPage
                    ? parseInt(req.query.currentPage as string)
                    : 1,
                limit: req.query.perPage
                    ? parseInt(req.query.perPage as string)
                    : 10,
            },
        );

        const finalProducts = (products.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image),
                };
            },
        );
        this.logger.info("All product have been fetched");
        res.json({
            data: finalProducts,
            total: products.total,
            perPage: products.perPage,
            currentPage: products.currentPage,
        });
    };

    destroy = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;

        if (!productId) {
            return next(createHttpError(400, "Invalid Params!"));
        }
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(400, "Topping not found"));
        }

        await this.storage.delete(product.image);

        await this.productService.deleteById(productId);
        this.logger.info("Product deleted!", { id: productId });

        // Send product Id to kafka
        await this.broker.sendMessage(
            config.get("topic.productTopic"),
            JSON.stringify({
                event_type: ProductEvents.PRODUCT_DELETE,
                data: {
                    _id: product._id,
                },
            }),
        );

        res.json("Product deleted!");
    };
}
