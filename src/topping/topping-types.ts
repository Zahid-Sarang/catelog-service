import { Request } from "express";

export interface Toppings {
    name: string;
    image: string;
    price: number;
    tenantId: string;
    isPublish: boolean;
}

export interface ToppingsRequest extends Request {
    body: Toppings;
}
