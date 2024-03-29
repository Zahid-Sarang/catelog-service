import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
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
toppingSchema.plugin(aggregatePaginate);

export default mongoose.model<Toppings, AggregatePaginateModel<Toppings>>(
    "Topping",
    toppingSchema,
);
