import { apiClient } from './api-client';

// Mirrors backend/WiMakit.API/Services/IPaymentService.cs -> OrderDTO
export interface Order {
  id: number;
  orderNumber: string;
  produceId: number;
  produceName: string;
  produceImageUrl?: string | null;
  quantity: number;
  quantityText: string;
  amount: number;
  paymentMethod: string;
  district?: string | null;
  deliveryAddress?: string | null;
  paymentRef?: string | null;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Completed' | string;
  createdAt: string;
  buyerId: number;
  buyerName: string;
  buyerInitials: string;
  farmerId: number;
  farmerName: string;
  farmerPhone?: string | null;
}

export interface PaymentRequest {
  produceId: number;
  quantity: number;
  paymentMethod: string;
  accountNumber: string;
  district?: string;
  deliveryAddress?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  orderNumber?: string;
}

export const ordersApi = {
  // GET /api/payment/buyer/history — every order this signed-in buyer has placed.
  getBuyerOrders: () => apiClient.get<Order[]>('/api/payment/buyer/history'),

  // POST /api/payment/process — places a real order for a single produce line item
  // (the cart checks out by calling this once per item, since the backend models
  // one order per produce purchase rather than a multi-item basket).
  processPayment: (request: PaymentRequest) =>
    apiClient.post<PaymentResult>('/api/payment/process', request),
};
