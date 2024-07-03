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
export interface Filter {
    tenantId?: string;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}

export enum ToppingEvents {
    TOPPING_CREATE = "TOPPING_CREATE",
    TOPPING_UPDATE = "TOPPING_UPDATE",
    TOPPING_DELETE = "TOPPING_DELETE",
}
