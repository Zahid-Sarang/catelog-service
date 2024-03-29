import categoryModal from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new categoryModal(category);
        return newCategory.save();
    }

    async getAll() {
        return await categoryModal.find();
    }
    async getById(categoryId: string) {
        return await categoryModal.findById(categoryId);
    }
    async updateById(categoryId: string, category: Category) {
        const { name, priceConfiguration, attributes } = category;
        return await categoryModal.findOneAndUpdate(
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
        return await categoryModal.deleteOne({ _id: categoryId });
    }
}
