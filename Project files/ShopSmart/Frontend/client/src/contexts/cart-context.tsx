import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getSessionId } from '@/lib/utils';
import type { CartItem, Product } from '@shared/schema';

interface CartContextType {
  cartItems: (CartItem & { product: Product })[];
  itemCount: number;
  subtotal: number;
  total: number;
  deliveryFee: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const deliveryFee = 25;

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart'],
    meta: {
      headers: {
        'X-Session-Id': getSessionId(),
      },
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { productId: number; quantity: number }) =>
      apiRequest('POST', '/api/cart', data, { 'X-Session-Id': getSessionId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiRequest('PUT', `/api/cart/${productId}`, { quantity }, { 'X-Session-Id': getSessionId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) =>
      apiRequest('DELETE', `/api/cart/${productId}`, undefined, { 'X-Session-Id': getSessionId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/cart', undefined, { 'X-Session-Id': getSessionId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const total = subtotal + deliveryFee;

  const addToCart = (productId: number, quantity = 1) => {
    addToCartMutation.mutate({ productId, quantity });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    updateQuantityMutation.mutate({ productId, quantity });
  };

  const removeFromCart = (productId: number) => {
    removeFromCartMutation.mutate(productId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        total,
        deliveryFee,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
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
