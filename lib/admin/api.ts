import { apiClient } from '@/lib/api-client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  totalFarmers: number
  totalBuyers: number
  pendingFarmerApprovals: number
  pendingProductApprovals: number
  openFraudCases: number
  totalRevenue: number
  activeProductListings: number
  ordersThisMonth: number
  revenueByMonth: { month: string; revenue: number; orders: number }[]
  growthByMonth: { month: string; farmers: number; buyers: number }[]
  topCrops: { crop: string; volume: number }[]
  districtBreakdown: { district: string; farmers: number; buyers: number }[]
}

export interface FarmerAdmin {
  id: number
  name: string
  email: string
  nin?: string
  idDocumentType?: string
  idDocumentFrontUrl?: string
  idDocumentBackUrl?: string
  profilePhotoUrl?: string
  farmPhotoUrl?: string
  phone?: string
  district?: string
  chiefdom?: string
  community?: string
  farmName?: string
  farmAddress?: string
  farmDescription?: string
  farmingExperience?: string
  crops: string[]
  farmSize?: string
  status: string
  trustScore: number
  verified: boolean
  submitted: string
  listings: number
  totalSales: number
}

export interface BuyerAdmin {
  id: number
  name: string
  email: string
  organization: string
  type: string
  district?: string
  phone?: string
  status: string
  orders: number
  spend: number
  joined: string
}

export interface ProductAdmin {
  id: number
  name: string
  farmer: string
  farmerId: number
  category: string
  unit: string
  price: number
  stock: number
  district?: string
  status: string
  submitted: string
}

export interface FraudCase {
  id: number
  caseNumber: string
  orderId: string
  buyer: string
  farmer: string
  reason: string
  amount: number
  status: string
  reported: string
  assignedTo?: string
}

export interface AuditLogEntry {
  id: number
  adminId: number
  adminName: string
  action: string
  targetType?: string
  targetId?: string
  details?: string
  createdAt: string
}

export interface NotificationItem {
  id: number
  userId?: number
  type: string
  title: string
  body: string
  isUnread: boolean
  createdAt: string
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const adminApi = {
  getMetrics: () => apiClient.get<AdminMetrics>('/api/admin/metrics'),

  getFarmers: (params?: { status?: string; search?: string; district?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    if (params?.district) qs.set('district', params.district)
    return apiClient.get<FarmerAdmin[]>(`/api/admin/farmers?${qs}`)
  },

  updateFarmerStatus: (id: number, status: string, note?: string) =>
    apiClient.put(`/api/admin/farmers/${id}/status`, { status, note }),

  getFarmerById: (id: number) => apiClient.get<FarmerAdmin>(`/api/admin/farmers/${id}`),

  getBuyers: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return apiClient.get<BuyerAdmin[]>(`/api/admin/buyers?${qs}`)
  },

  updateBuyerStatus: (id: number, status: string) =>
    apiClient.put(`/api/admin/buyers/${id}/status`, { status }),

  getProducts: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return apiClient.get<ProductAdmin[]>(`/api/admin/products?${qs}`)
  },

  updateProductStatus: (id: number, status: string, note?: string) =>
    apiClient.put(`/api/admin/products/${id}/status`, { status, note }),

  createProduct: (data: {
    farmerId: number
    name: string
    category: string
    description: string
    price: number
    unit: string
    quantity: number
    location?: string
    district?: string
    imageUrl?: string
    status?: string
  }) => apiClient.post<ProductAdmin>('/api/admin/products', data),

  updateProduct: (
    id: number,
    data: {
      name?: string
      category?: string
      description?: string
      price?: number
      unit?: string
      quantity?: number
      location?: string
      district?: string
      imageUrl?: string
      status?: string
    },
  ) => apiClient.put<ProductAdmin>(`/api/admin/products/${id}`, data),

  deleteProduct: (id: number) => apiClient.delete(`/api/admin/products/${id}`),

  getFraudCases: (params?: { status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    return apiClient.get<FraudCase[]>(`/api/admin/fraud-cases?${qs}`)
  },

  updateFraudCase: (id: number, status: string, assignedTo?: string) =>
    apiClient.put(`/api/admin/fraud-cases/${id}/status`, { status, assignedTo }),

  getAuditLogs: () => apiClient.get<AuditLogEntry[]>('/api/admin/audit-logs'),

  broadcastNotification: (title: string, body: string, targetRole?: string) =>
    apiClient.post('/api/admin/notifications/broadcast', { title, body, targetRole }),

  getNotifications: () => apiClient.get<NotificationItem[]>('/api/notifications'),

  markNotificationRead: (id: number) => apiClient.put(`/api/notifications/${id}/read`, {}),
}

// ─── Currency helper ──────────────────────────────────────────────────────────

export function LE(amount: number) {
  return `Le ${Number(amount).toLocaleString()}`
}
