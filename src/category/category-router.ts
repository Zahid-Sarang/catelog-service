import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";

const categoryRouter = express.Router();

const categoryController = new CategoryController();
categoryRouter.post("/", categoryValidator, categoryController.create);

export default categoryRouter;
