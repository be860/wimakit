import { apiClient } from '@/lib/api-client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FarmerProduce {
  id: number
  farmerId: number
  farmerName: string
  farmerLocation: string
  name: string
  category: string
  description: string
  price: number
  unit: string
  quantity: number
  location?: string
  imageUrl?: string
  status: string
  createdAt: string
}

export interface FarmerProfile {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  role: string
  nin?: string
  idDocumentType?: string
  idDocumentFrontUrl?: string
  idDocumentBackUrl?: string
  profilePhotoUrl?: string
  farmPhotoUrl?: string
  district?: string
  chiefdom?: string
  community?: string
  farmName?: string
  farmAddress?: string
  primaryCrops?: string
  farmSize?: string
  farmingExperience?: string
  farmDescription?: string
  trustScore?: number
  verificationStatus?: string
  status?: string
  notifyNewOrders?: boolean
  notifyListingApprovals?: boolean
  notifyMessages?: boolean
  notifyBroadcasts?: boolean
  createdAt?: string
}

export interface FarmerOrder {
  id: number
  orderNumber: string
  produceId: number
  produceName: string
  produceCategory?: string
  buyerId: number
  buyerName: string
  buyerPhone?: string
  farmerId: number
  farmerName: string
  quantity: number
  totalAmount: number
  amount: number
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Disputed' | string
  paymentMethod?: string
  deliveryAddress?: string
  district?: string
  createdAt: string
  updatedAt?: string
}

export interface Conversation {
  userId: number
  userName: string
  userProfilePhotoUrl?: string
  userLocation?: string
  userRole: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  produceId?: number
  produceName?: string
}

export type MessageType = 'text' | 'voice' | 'image'

export interface Message {
  id: number
  senderId: number
  senderName: string
  senderProfilePhotoUrl?: string
  receiverId: number
  receiverName: string
  produceId?: number
  produceName?: string
  content: string
  messageType: MessageType
  attachmentUrl?: string
  attachmentDurationSeconds?: number
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  isRead: boolean
}

export interface FarmerNotification {
  id: number
  userId?: number
  type: string
  title: string
  body: string
  isUnread: boolean
  createdAt: string
}

export interface FarmerReview {
  id: number
  farmerId: number
  farmerName: string
  buyerId: number
  buyerName: string
  buyerProfilePhotoUrl?: string
  rating: number
  comment: string
  reply?: string
  createdAt: string
}

export interface RatingDistribution {
  averageRating: number
  totalReviews: number
  stars: { [star: number]: number }
}

export interface FarmerProfile {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  role: string
  nin?: string
  district?: string
  chiefdom?: string
  community?: string
  farmName?: string
  primaryCrops?: string
  farmSize?: string
  trustScore?: number
  verificationStatus?: string
  status?: string
}

export interface FarmerMetrics {
  totalSalesRevenue: number
  activeListingsCount: number
  pendingOrdersCount: number
  completedOrdersCount: number
  averageRating: number
  totalReviewsCount: number
  totalProduceQuantity: number
}

// ─── API Client ──────────────────────────────────────────────────────────────

export const farmerApi = {
  // Produce / Listings
  getFarmerProduce: (farmerId: number) =>
    apiClient.get<FarmerProduce[]>(`/api/produce/farmer/${farmerId}`),

  getProduceById: (id: number) => apiClient.get<FarmerProduce>(`/api/produce/${id}`),

  getAllProduce: (params?: { search?: string; category?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.category) qs.set('category', params.category)
    return apiClient.get<FarmerProduce[]>(`/api/produce?${qs}`)
  },

  createProduce: (data: {
    name: string
    category: string
    description: string
    price: number
    unit: string
    quantity: number
    location?: string
    imageUrl?: string
  }) => apiClient.post<FarmerProduce>('/api/produce', data),

  updateProduce: (
    id: number,
    data: {
      name?: string
      category?: string
      description?: string
      price?: number
      unit?: string
      quantity?: number
      location?: string
      imageUrl?: string
      status?: string
    },
  ) => apiClient.put<FarmerProduce>(`/api/produce/${id}`, data),

  deleteProduce: (id: number) => apiClient.delete(`/api/produce/${id}`),

  uploadProduceImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ imageUrl: string }>('/api/upload', form)
  },

  // Orders / Sales
  getFarmerSales: () => apiClient.get<FarmerOrder[]>('/api/payment/farmer/sales'),

  updateOrderStatus: (id: number, status: string) =>
    apiClient.put(`/api/payment/orders/${id}/status`, { status }),

  // Messages
  getConversations: () => apiClient.get<Conversation[]>('/api/messages/conversations'),

  getConversation: (otherUserId: number) =>
    apiClient.get<Message[]>(`/api/messages/conversation/${otherUserId}`),

  sendMessage: (
    receiverId: number,
    data: {
      content?: string
      produceId?: number
      messageType?: MessageType
      attachmentUrl?: string
      attachmentDurationSeconds?: number
    },
  ) => apiClient.post<Message>('/api/messages', { receiverId, ...data }),

  editMessage: (id: number, content: string) =>
    apiClient.put<Message>(`/api/messages/${id}`, { content }),

  deleteMessage: (id: number) => apiClient.delete<void>(`/api/messages/${id}`),

  uploadMessageAttachment: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ url: string; type: 'image' | 'voice' }>('/api/messages/attachment', form)
  },

  markMessageRead: (id: number) => apiClient.put(`/api/messages/${id}/read`),

  // Notifications
  getNotifications: () => apiClient.get<FarmerNotification[]>('/api/notifications'),

  markNotificationRead: (id: number) => apiClient.put(`/api/notifications/${id}/read`),

  // Reviews
  getFarmerReviews: (farmerId: number) =>
    apiClient.get<FarmerReview[]>(`/api/reviews/farmer/${farmerId}`),

  getRatingDistribution: (farmerId: number) =>
    apiClient.get<RatingDistribution>(`/api/reviews/farmer/${farmerId}/distribution`),

  replyToReview: (reviewId: number, reply: string) =>
    apiClient.post(`/api/reviews/${reviewId}/reply`, { reply }),

  // User Profile
  getProfile: () => apiClient.get<FarmerProfile>('/api/user/profile'),

  updateProfile: (data: Partial<FarmerProfile>) =>
    apiClient.put<FarmerProfile>('/api/user/profile', data),

  uploadProfilePhoto: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post<FarmerProfile>('/api/user/profile-photo', fd)
  },

  uploadFarmPhoto: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post<FarmerProfile>('/api/user/farm-photo', fd)
  },
}

export function LE(amount: number) {
  return `Le ${Number(amount || 0).toLocaleString()}`
}
