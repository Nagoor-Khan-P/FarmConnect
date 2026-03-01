'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type CartItem = {
  id: string; // This is the cartItemId (UUID from backend)
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  unit: string;
  farmName: string;
  farmerName: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchServerCart = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/cart', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        // Updated mapping to match the backend DTO structure:
        // private UUID id; (cartItemId)
        // private UUID productId;
        // private String productName;
        // private int quantity;
        // private double price;
        // private String imageUrl;
        // private String farmName;
        // private String farmerName;
        const items = data.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          farmName: item.farmName || '',
          farmerName: item.farmerName || '',
          image: item.imageUrl || ''
        }));
        setCart(items);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      const savedCart = localStorage.getItem('farmconnect_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse local cart", e);
        }
      }
    }
  }, [isAuthenticated, fetchServerCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('farmconnect_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product: any) => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch('http://localhost:8080/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            productId: product.productId || product.id,
            quantity: 1
          })
        });
        if (response.ok) {
          await fetchServerCart();
        }
      } catch (error) {
        console.error("Error adding to server cart:", error);
      }
    } else {
      setCart((prev) => {
        const targetId = product.productId || product.id;
        const existing = prev.find((i) => (i.productId === targetId || i.id === targetId));
        if (existing) {
          return prev.map((i) =>
            (i.productId === targetId || i.id === targetId) ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { 
          id: product.id, 
          productId: product.id,
          name: product.name, 
          price: product.price, 
          image: product.image || product.imageUrl || '', 
          unit: product.unit || 'kg', 
          farmName: product.farmName || 'Local Farm',
          farmerName: product.farmerName || product.farmer || 'Local Farmer',
          quantity: 1 
        }];
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`http://localhost:8080/api/cart/remove/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          await fetchServerCart();
        }
      } catch (error) {
        console.error("Error removing from server cart:", error);
      }
    } else {
      setCart((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (isAuthenticated && token) {
      if (delta === -1) {
        try {
          // Decrement quantity using POST /api/cart/decrease/{cartItemId}
          const response = await fetch(`http://localhost:8080/api/cart/decrease/${id}`, {
            method: 'POST',
            headers: { 
              'Authorization': token 
            }
          });
          if (response.ok) {
            await fetchServerCart();
          }
        } catch (error) {
          console.error("Error decreasing quantity on server:", error);
        }
      } else if (delta === 1) {
        await addToCart(item);
      }
    } else {
      // Guest user local logic
      if (delta === -1) {
        if (item.quantity === 1) {
          setCart(prev => prev.filter(i => i.id !== id));
        } else {
          setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
        }
      } else if (delta === 1) {
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
      }
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch('http://localhost:8080/api/cart/clear', {
          method: 'DELETE',
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          setCart([]);
        }
      } catch (error) {
        console.error("Error clearing server cart:", error);
      }
    } else {
      setCart([]);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}