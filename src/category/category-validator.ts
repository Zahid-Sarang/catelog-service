import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Category name is required")
        .isString()
        .withMessage("Category name should be a string"),
    body("priceConfiguration is required")
        .exists()
        .withMessage("Price configuration is required"),
    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("price type is required")
        .custom((value: "base" | "aditional") => {
            const validkeys = ["base", "additional"];
            if (!validkeys.includes(value)) {
                throw new Error(
                    `${value} is invalid attribute for priceType field. Possible values are:[${validkeys.join(
                        ",",
                    )}]`,
                );
            }
        }),
    body("attributes").exists().withMessage("Attributes fields is required"),
];
