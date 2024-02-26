import express from "express";
import { Roles } from "../common/constants";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { asyncWrapper } from "../common/utils/ErrorWrapper";
import logger from "../config/logger";
import { CategoryController } from "./category-controller";
import { CategoryService } from "./category-service";
import categoryValidator from "./create-category-validator";

const categoryRouter = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);
categoryRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

export default categoryRouter;
