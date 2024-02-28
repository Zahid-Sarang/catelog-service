import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return await CategoryModel.find();
    }
    async getById(categoryId: string) {
        return await CategoryModel.findById(categoryId);
    }
    async updateById(categoryId: string, category: Category) {
        const { name, priceConfiguration, attributes } = category;
        return await CategoryModel.findOneAndUpdate(
            {
                _id: categoryId,
            },
            {
                name,
                priceConfiguration,
                attributes,
            },
            { new: true },
        );
    }

    async deleteById(categoryId: string) {
        return await CategoryModel.deleteOne({ _id: categoryId });
    }
}
