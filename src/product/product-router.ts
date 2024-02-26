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

const productRouter = express.Router();
const productService = new ProductService();
const productController = new ProductController(productService, logger);
productRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    createProductValidator,
    asyncWrapper(productController.create),
);

export default productRouter;
