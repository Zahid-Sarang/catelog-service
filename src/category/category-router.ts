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

categoryRouter.get("/", authenticate, asyncWrapper(categoryController.getList));
categoryRouter.get(
    "/:id",
    authenticate,
    asyncWrapper(categoryController.getOne),
);

categoryRouter.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.update),
);
categoryRouter.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    asyncWrapper(categoryController.destroy),
);
export default categoryRouter;
