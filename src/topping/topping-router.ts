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
import createToppingValidator from "./create-topping-validator";
import updateToppingValidator from "./update-topping-validator";
import logger from "../config/logger";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";

const toppinRouter = express.Router();
const toppingSerivce = new ToppingService();
const fileStorage = new S3Storage();
const broker = createMessageProducerBroker();
const toppingController = new ToppingController(
    toppingSerivce,
    fileStorage,
    logger,
    broker,
);

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
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

toppinRouter.put(
    "/:toppingId",
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
    updateToppingValidator,
    asyncWrapper(toppingController.update),
);

toppinRouter.get("/:toppingId", asyncWrapper(toppingController.getOne));
toppinRouter.get("/", asyncWrapper(toppingController.getList));
toppinRouter.delete(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.destroy),
);

export default toppinRouter;
