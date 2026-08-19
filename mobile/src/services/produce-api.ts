import { apiClient } from './api-client';

// Mirrors backend/WiMakit.API/DTOs/ProduceDTOs.cs -> ProduceDTO
export interface Produce {
  id: number;
  farmerId: number;
  farmerName: string;
  farmerLocation: string;
  farmerProfilePhotoUrl?: string | null;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  location?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
}

export interface GetProduceParams {
  search?: string;
  category?: string;
}

export const produceApi = {
  // GET /api/produce — public/anonymous, but the app always has a token attached
  // when the buyer is signed in. Only "Live" (admin-approved) listings come back.
  getAll: (params?: GetProduceParams) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category && params.category !== 'all') qs.set('category', params.category);
    const query = qs.toString();
    return apiClient.get<Produce[]>(`/api/produce${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiClient.get<Produce>(`/api/produce/${id}`),

  getByFarmer: (farmerId: number) =>
    apiClient.get<Produce[]>(`/api/produce/farmer/${farmerId}`),
};

/** Formats a decimal amount as Sierra Leonean Leone, matching the web admin's LE() helper. */
export function formatLE(amount: number): string {
  return `Le ${Math.round(amount).toLocaleString('en-US')}`;
}
