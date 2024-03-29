import { paginationLabels } from "../config/pagination";
import toppingModel from "./topping-model";
import { Filter, PaginateQuery, Toppings } from "./topping-types";

export class ToppingService {
    constructor() {}

    async createTopping(topping: Toppings) {
        return await toppingModel.create(topping);
    }

    async getTopping(toppingId: string) {
        return await toppingModel.findById(toppingId);
    }

    async getToppings(
        q: string,
        filters: Filter,
        paginatedQuery: PaginateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = toppingModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);
        return toppingModel.aggregatePaginate(aggregate, {
            ...paginatedQuery,
            customLabels: paginationLabels,
        });
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

    async deleteById(toppingId: string) {
        return await toppingModel.deleteOne({ _id: toppingId });
    }
}
