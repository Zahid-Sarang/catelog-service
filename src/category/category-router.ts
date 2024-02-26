import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { asyncWrapper } from "../common/utils/ErrorWrapper";
import logger from "../config/logger";
import { CategoryController } from "./category-controller";
import { CategoryService } from "./category-service";
import categoryValidator from "./category-validator";

const categoryRouter = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);
categoryRouter.post(
    "/",
    authenticate,
    categoryValidator,
    asyncWrapper(categoryController.create),
);

export default categoryRouter;
