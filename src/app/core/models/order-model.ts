// src/app/core/models/order.model.ts

export enum OrderStatus {
  NEW = 'NEW',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELED = 'CANCELED'
}

export interface Order {
  uuid: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productUuid: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  items: CreateOrderItem[];
}

export interface CreateOrderItem {
  productUuid: string;
  quantity: number;
}