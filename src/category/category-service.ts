import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return CategoryModel.find();
    }
    async getById(categoryId: string) {
        return CategoryModel.findById(categoryId);
    }
    async updateById(categoryId: string, category: Category) {
        const { name, priceConfiguration, attributes } = category;
        return CategoryModel.findOneAndUpdate(
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
}
