import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { asyncWrapper } from "../common/utils/ErrorWrapper";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import { S3Storage } from "../common/services/S3Storage";

const toppinRouter = express.Router();
const toppingSerivce = new ToppingService();
const fileStorage = new S3Storage();
const toppingController = new ToppingController(toppingSerivce, fileStorage);

toppinRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    asyncWrapper(toppingController.create),
);

export default toppinRouter;
