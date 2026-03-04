
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

export type WishlistItem = {
  id: string; // wishlistItemId
  productId: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  farmName: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  moveToCart: (wishlistItemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isLoading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/wishlist', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.productName,
          price: item.price,
          image: item.imageUrl || '',
          unit: item.unit || 'kg',
          farmName: item.farmName || ''
        })));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/wishlist/add/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  }, [token, fetchWishlist]);

  const removeFromWishlist = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/wishlist/remove/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }, [token, fetchWishlist]);

  const moveToCart = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/wishlist/move-to-cart/${id}`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        await fetchWishlist();
        await refreshCart();
      }
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  }, [token, fetchWishlist, refreshCart]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  const value = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist,
    wishlistCount,
    isLoading
  }), [wishlist, addToWishlist, removeFromWishlist, moveToCart, isInWishlist, wishlistCount, isLoading]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
