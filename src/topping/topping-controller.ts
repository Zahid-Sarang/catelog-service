import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { ToppingService } from "./topping-service";
import { FileStorage } from "../common/types/storage";
import { ToppingsRequest } from "./topping-types";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private strorage: FileStorage,
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
        await this.strorage.upload({
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
}
