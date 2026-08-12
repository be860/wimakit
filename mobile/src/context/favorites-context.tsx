import React, { createContext, useContext, useMemo, useState } from 'react';

interface FavoritesContextType {
  favoriteIds: Set<number>;
  isFavorite: (produceId: number) => boolean;
  toggleFavorite: (produceId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * NOTE: There is currently no backend endpoint for buyer wishlists/favorites,
 * so this is session-only, in-memory state — it resets on app restart and
 * isn't shared across devices. Swap this out for a real API-backed context
 * once a favorites endpoint exists on the backend.
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const toggleFavorite = (produceId: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(produceId)) {
        next.delete(produceId);
      } else {
        next.add(produceId);
      }
      return next;
    });
  };

  const isFavorite = (produceId: number) => favoriteIds.has(produceId);

  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite }), [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
