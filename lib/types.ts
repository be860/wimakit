// TypeScript types for WiMakit platform

export type UserRole = "farmer" | "buyer"

export interface User {
  id: string
  email: string
  password: string // In production, this would be hashed on the backend
  role: UserRole
  firstName: string
  lastName: string
  /** Computed display name */
  name?: string
  phone: string
  location: string
  createdAt: string
}

export interface Farmer extends User {
  role: "farmer"
  farmSize?: string
  farmingExperience?: string
}

export interface Buyer extends User {
  role: "buyer"
  businessName?: string
  businessType?: string
}

export interface Produce {
  id: string
  farmerId: string
  farmerName: string
  farmerLocation: string
  farmerPhone: string
  name: string
  category: string
  quantity: string
  unit: string
  pricePerUnit: number
  description: string
  harvestDate: string
  imageUrl: string
  status: "available" | "sold" | "reserved"
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  farmerId: string
  farmerName: string
  buyerId: string
  buyerName: string
  produceId?: string
  produceName?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}
