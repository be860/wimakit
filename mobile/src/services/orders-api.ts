import { apiClient } from './api-client';
import { formatLE } from './produce-api';

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  farmerId: number;
  produceId: number;
  produceName: string;
  farmerName: string;
  quantity: number;
  amount: number;
  district?: string;
  deliveryAddress?: string;
  paymentRef?: string;
  paymentMethod: string;
  accountNumber: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Completed';
  createdAt: string;
}

export interface PlaceOrderRequest {
  produceId: number;
  farmerId: number;
  quantity: number;
  paymentMethod?: string;
  accountNumber?: string;
  deliveryAddress?: string;
  district?: string;
}

export const ordersApi = {
  /** GET /api/payment/buyer/history — Buyer's order history */
  getBuyerOrders: () => apiClient.get<Order[]>('/api/payment/buyer/history'),

  /** POST /api/payment/process — Place a new order (checkout) */
  placeOrder: (request: PlaceOrderRequest & { buyerId?: number }) =>
    apiClient.post<{ success: boolean; message: string; orderNumber: string }>(
      '/api/payment/process',
      request
    ),
};

export { formatLE };
