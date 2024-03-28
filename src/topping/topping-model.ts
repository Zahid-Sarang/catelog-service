import mongoose from "mongoose";
import { Toppings } from "./topping-types";

const toppingSchema = new mongoose.Schema<Toppings>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        tenantId: {
            type: String,
            required: true,
        },
        isPublish: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Topping", toppingSchema);
