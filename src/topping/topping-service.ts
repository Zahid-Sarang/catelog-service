import toppingModel from "./topping-model";
import { Toppings } from "./topping-types";

export class ToppingService {
    constructor() {}

    async createTopping(topping: Toppings) {
        return await toppingModel.create(topping);
    }
}
