import express from "express";
import { Roles } from "../common/constants";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { asyncWrapper } from "../common/utils/ErrorWrapper";
import createProductValidator from "./create-product-validator";
import { ProductController } from "./product-controller";

const productRouter = express.Router();

const productController = new ProductController();
productRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createProductValidator,
    asyncWrapper(productController.create),
);

export default productRouter;
