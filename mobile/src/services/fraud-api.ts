import { apiClient } from './api-client';

export interface FraudCase {
  id: number;
  orderId: string;
  reason: string;
  status: string;
  reportedAt: string;
}

export interface ReportFraudRequest {
  orderId: string;
  reason: string;
}

export const fraudApi = {
  /** Report a fraud case for an order */
  reportFraud: (request: ReportFraudRequest) =>
    apiClient.post<FraudCase>('/api/fraud-cases', request),

  /** Get buyer's reported fraud cases */
  getBuyerFraudCases: () => apiClient.get<FraudCase[]>('/api/fraud-cases/buyer'),

  /** Alias for buyer fraud reports */
  getMyReports: (): Promise<FraudCase[]> =>
    apiClient.get<FraudCase[]>('/api/fraud-cases/buyer').catch(() => []),
};

