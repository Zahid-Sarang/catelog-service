import { Request } from "express-jwt";

export interface Product {
    name: string;
    description: string;
    priceConfiguration: string;
    attributes: string;
    tenantId: string;
    categoryId: string;
    image: string;
    isPublish: boolean;
}

export interface ProductRequest extends Request {
    body: Product;
}
