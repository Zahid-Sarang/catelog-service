import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { ToppingService } from "./topping-service";
import { FileStorage } from "../common/types/storage";
import { ToppingsRequest } from "./topping-types";
import { Roles } from "../common/constants";
import { AuthRequest } from "../common/types";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: FileStorage,
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

        res.json(updateTopping);
    };
}
