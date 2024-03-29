import express from "express";
import fileUpload from "express-fileupload";
import { Roles } from "../common/constants";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { asyncWrapper } from "../common/utils/ErrorWrapper";
import logger from "../config/logger";
import createProductValidator from "./create-product-validator";
import { ProductController } from "./product-controller";
import { ProductService } from "./product-service";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";

const productRouter = express.Router();
const productService = new ProductService();
const s3Storage = new S3Storage();
const productController = new ProductController(
    productService,
    logger,
    s3Storage,
);
productRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 5000 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(
                400,
                "File Size exceeds the maximum limit",
            );
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);

productRouter.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 5000 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(
                400,
                "File Size exceeds the maximum limit",
            );
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

productRouter.get("/", asyncWrapper(productController.getList));
productRouter.delete("/:productId", asyncWrapper(productController.destroy));

export default productRouter;
