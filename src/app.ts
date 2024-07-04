/* eslint-disable @typescript-eslint/no-unsafe-call */
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import express, { Request, Response } from "express";
import categoryRouter from "./category/category-router";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import productRouter from "./product/product-router";
import toppinRouter from "./topping/topping-router";

const app = express();

const ALLOWED_DOMAINS = [
    config.get<string>("frontend.clientUI"),
    config.get<string>("frontend.adminUI"),
];

app.use(
    cors({
        origin: ALLOWED_DOMAINS,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service!" });
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppinRouter);

app.use(globalErrorHandler);

export default app;
