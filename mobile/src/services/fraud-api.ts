import { apiClient } from './api-client';

export interface FraudCase {
  id: number;
  caseNumber: string;
  orderId?: number;
  orderNumber?: string;
  produceName: string;
  farmerName: string;
  reason: string;
  amount: number;
  status: string;
  reportedAt: string;
  resolvedAt?: string;
}

export interface ReportFraudRequest {
  orderId: number;
  reason: string;
}

export interface ReportFraudResponse {
  fraudCase: FraudCase;
  message: string;
}

export const fraudApi = {
  /** Report a fraud case for an order */
  reportFraud: (request: ReportFraudRequest) =>
    apiClient.post<ReportFraudResponse>('/api/fraud/report', request),

  /** Buyer's own fraud report history */
  getMyReports: () => apiClient.get<FraudCase[]>('/api/fraud/my-reports'),
};

