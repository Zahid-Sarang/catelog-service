import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { ToppingService } from "./topping-service";
import { FileStorage } from "../common/types/storage";
import {
    Filter,
    ToppingEvents,
    Toppings,
    ToppingsRequest,
} from "./topping-types";
import { Roles } from "../common/constants";
import { AuthRequest } from "../common/types";
import { Logger } from "winston";
import { MessageProducerBroker } from "../common/types/broker";
import config from "config";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: FileStorage,
        private logger: Logger,
        private broker: MessageProducerBroker,
    ) {}
    create = async (
        req: ToppingsRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        // Upload image to s3 bucket
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            fileName: imageName,
            fileData: image.data.buffer,
        });

        const { name, price, tenantId, isPublish } = req.body;
        const topping = {
            name,
            price,
            image: imageName,
            tenantId,
            isPublish,
        };

        // store topping in database
        const newTopping = await this.toppingService.createTopping(topping);
        this.logger.info("Topping has been created", {
            id: newTopping._id,
        });

        // Send topping to kafka.
        await this.broker.sendMessage(
            config.get("topic.toppingTopic"),
            JSON.stringify({
                event_type: ToppingEvents.TOPPING_CREATE,
                data: {
                    _id: newTopping._id,
                    price: newTopping.price,
                    tenantId: newTopping.tenantId,
                },
            }),
        );
        res.json({ id: newTopping._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { toppingId } = req.params;

        const topping = await this.toppingService.getTopping(toppingId);

        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (topping.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this toppings!",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;
        if (req.files?.image) {
            oldImage = topping.image;
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                fileName: imageName,
                fileData: image.data.buffer,
            });
            await this.storage.delete(oldImage);
        }

        const { name, price, tenantId, isPublish } = req.body;
        const updateToppingData = {
            name,
            price,
            image: imageName ? imageName : (oldImage as string),
            tenantId,
            isPublish,
        };
        const updateTopping = await this.toppingService.updateTopping(
            toppingId,
            updateToppingData,
        );

        this.logger.info("Topping has been updated", {
            id: updateTopping!._id,
        });

        // Send topping to kafka.
        await this.broker.sendMessage(
            config.get("topic.toppingTopic"),
            JSON.stringify({
                event_type: ToppingEvents.TOPPING_UPDATE,
                data: {
                    _id: updateTopping!._id,
                    price: updateTopping!.price,
                    tenantId: updateTopping!.tenantId,
                },
            }),
        );

        res.json(updateTopping);
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;

        if (!toppingId) {
            return next(createHttpError(400, "Invalid url params!"));
        }
        const topping = await this.toppingService.getTopping(toppingId);
        if (!topping) {
            return next(createHttpError(400, "Topping not found!"));
        }
        this.logger.info("Topping has been fetched", { id: topping._id });

        res.json(topping);
    };

    getList = async (req: Request, res: Response) => {
        const { q, tenantId, isPublish } = req.query;
        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }
        if (tenantId) filters.tenantId = tenantId as string;

        const toppings = await this.toppingService.getToppings(
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

        const finalToppings = (toppings.data as Toppings[]).map(
            (topping: Toppings) => {
                return {
                    ...topping,
                    image: this.storage.getObjectUri(topping.image),
                };
            },
        );

        this.logger.info("All toping have been fetched");

        res.json({
            data: finalToppings,
            total: toppings.total,
            perPage: toppings.perPage,
            currentPage: toppings.currentPage,
        });
    };

    destroy = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;

        if (!toppingId) {
            return next(createHttpError(400, "Invalid Params!"));
        }
        const topping = await this.toppingService.getTopping(toppingId);
        if (!topping) {
            return next(createHttpError(400, "Topping not found"));
        }

        await this.storage.delete(topping.image);

        await this.toppingService.deleteById(toppingId);
        this.logger.info("Topping deleted!", { id: toppingId });

        // Send topping Id to kafka.
        await this.broker.sendMessage(
            config.get("topic.toppingTopic"),
            JSON.stringify({
                event_type: ToppingEvents.TOPPING_DELETE,
                data: {
                    _id: topping._id,
                },
            }),
        );

        res.json("Topping deleted!");
    };
}
