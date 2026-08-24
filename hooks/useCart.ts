"use client";

import { useCallback, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types";

interface UseCartReturn {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          price_at_transaction: product.price_sell,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price_at_transaction * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return { items, totalAmount, totalItems, addItem, removeItem, updateQuantity, clearCart };
}