import { apiClient } from './api-client';

// Mirrors backend/WiMakit.API/DTOs/FraudDTOs.cs -> BuyerFraudCaseDTO
export interface FraudCase {
  id: number;
  caseNumber: string;
  orderId?: number | null;
  orderNumber?: string | null;
  produceName: string;
  farmerName: string;
  reason: string;
  amount: number;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Rejected' | string;
  reportedAt: string;
  resolvedAt?: string | null;
}

export interface ReportFraudRequest {
  orderId: number;
  reason: string;
}

interface ReportFraudResponse {
  fraudCase: FraudCase;
  message: string;
}

export const fraudApi = {
  // POST /api/fraud/report — buyer reports an issue on one of their own orders.
  report: (request: ReportFraudRequest) =>
    apiClient.post<ReportFraudResponse>('/api/fraud/report', request),

  // GET /api/fraud/my-reports — every fraud report this buyer has filed, with live status.
  getMyReports: () => apiClient.get<FraudCase[]>('/api/fraud/my-reports'),
};
