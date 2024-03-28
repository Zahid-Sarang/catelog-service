import toppingModel from "./topping-model";
import { Toppings } from "./topping-types";

export class ToppingService {
    constructor() {}

    async createTopping(topping: Toppings) {
        return await toppingModel.create(topping);
    }

    async getTopping(toppingId: string) {
        return await toppingModel.findById(toppingId);
    }

    async updateTopping(toppingId: string, topping: Toppings) {
        return await toppingModel.findByIdAndUpdate(
            { _id: toppingId },
            {
                $set: topping,
            },
            {
                new: true,
            },
        );
    }
}
