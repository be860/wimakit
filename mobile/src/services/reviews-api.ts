import { apiClient } from './api-client';

export interface Review {
  id: number;
  produceId?: number;
  product: string;
  farmerId: number;
  buyerId: number;
  buyer: string;
  buyerProfilePhotoUrl?: string;
  initials: string;
  rating: number;
  comment: string;
  reply?: string;
  date: string;
}

export interface CreateReviewPayload {
  produceId?: number;
  farmerId: number;
  rating: number;
  comment: string;
}

export interface RatingDistribution {
  stars: number;
  count: number;
}

export const reviewsApi = {
  /** Get all reviews for a specific farmer */
  getFarmerReviews: (farmerId: number) =>
    apiClient.get<Review[]>(`/api/reviews/farmer/${farmerId}`),

  /** Get rating breakdown (5 star to 1 star count) for a farmer */
  getRatingDistribution: (farmerId: number) =>
    apiClient.get<RatingDistribution[]>(`/api/reviews/farmer/${farmerId}/distribution`),

  /** Create a new review for a produce item/farmer (buyer endpoint) */
  createReview: (payload: CreateReviewPayload) =>
    apiClient.post<Review>('/api/reviews', payload),
};
