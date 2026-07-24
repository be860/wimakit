// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Auth Token Management
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("authToken", token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("authToken")
}

// API Request Helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const url = `${API_BASE_URL}${endpoint}`.replace(/([^:]\/)\/+/g, "$1")

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Authentication API
export interface RegisterData {
  name: string
  email: string
  password: string
  role: "farmer" | "buyer"
  phone?: string
  location?: string
  farmSize?: string
  farmingExperience?: string
  businessName?: string
  businessType?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
    role: "farmer" | "buyer"
    phone?: string
    location?: string
    farmSize?: string
    farmingExperience?: string
    businessName?: string
    businessType?: string
    isEmailVerified: boolean
  }
}

export const authAPI = {
  register: (data: RegisterData) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginData) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyEmail: (token: string) =>
    apiRequest<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
}

// Produce API
export interface ProduceData {
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

export interface CreateProduceData {
  name: string
  category: string
  description: string
  price: number
  unit: string
  quantity: number
  location?: string
  imageUrl?: string
}

export interface UpdateProduceData extends Partial<CreateProduceData> {
  status?: string
}

export const produceAPI = {
  getAll: (params?: { search?: string; category?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    const query = searchParams.toString()
    return apiRequest<ProduceData[]>(`/produce${query ? `?${query}` : ""}`)
  },

  getById: (id: number) => apiRequest<ProduceData>(`/produce/${id}`),

  getByFarmer: (farmerId: number) => apiRequest<ProduceData[]>(`/produce/farmer/${farmerId}`),

  create: (data: CreateProduceData) =>
    apiRequest<ProduceData>("/produce", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateProduceData) =>
    apiRequest<ProduceData>(`/produce/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/produce/${id}`, {
      method: "DELETE",
    }),
}

// Messages API
export interface MessageData {
  id: number
  senderId: number
  senderName: string
  receiverId: number
  receiverName: string
  produceId?: number
  produceName?: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface ConversationData {
  userId: number
  userName: string
  userLocation?: string
  userRole: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  produceId?: number
  produceName?: string
}

export interface SendMessageData {
  receiverId: number
  produceId?: number
  content: string
}

export const messagesAPI = {
  getConversations: () => apiRequest<ConversationData[]>("/messages/conversations"),

  getConversation: (otherUserId: number) => apiRequest<MessageData[]>(`/messages/conversation/${otherUserId}`),

  send: (data: SendMessageData) =>
    apiRequest<MessageData>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  markAsRead: (messageId: number) =>
    apiRequest<void>(`/messages/${messageId}/read`, {
      method: "PUT",
    }),
}

// Image Upload Helper
export const uploadImage = async (file: File): Promise<string> => {
  const token = getAuthToken()
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(error.message || `HTTP ${response.status} - Upload failed`)
  }

  const data = await response.json()
  return data.imageUrl
}

export interface OrderData {
  id: number
  produceId: number
  produceName: string
  produceImageUrl?: string
  amount: number
  paymentMethod: string
  status: string
  createdAt: string
  buyerName: string
  farmerName: string
}

export interface PaymentRequest {
  produceId: number
  amount: number
  paymentMethod: string
  accountNumber: string
}

export const paymentAPI = {
  processPayment: (data: PaymentRequest) =>
    apiRequest<{ success: boolean; message: string }>("/payment/process", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBuyerHistory: () => apiRequest<OrderData[]>("/payment/buyer/history"),

  getFarmerSales: () => apiRequest<OrderData[]>("/payment/farmer/sales"),
}
