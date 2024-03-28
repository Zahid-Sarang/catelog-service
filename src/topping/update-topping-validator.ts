import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Topping name is required")
        .isString()
        .withMessage("Topping name should be a string"),
    body("price")
        .exists()
        .withMessage("Price  is required")
        .isNumeric()
        .withMessage("Price should be a number"),
    body("tenantId").exists().withMessage("Tenant id field is required"),
];
