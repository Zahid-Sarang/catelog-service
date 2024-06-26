import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import categoryRouter from "./category/category-router";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import productRouter from "./product/product-router";
import toppinRouter from "./topping/topping-router";

const app = express();
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
