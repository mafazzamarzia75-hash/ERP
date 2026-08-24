"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrders(source?: "pos" | "sales" | "web"): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (source) query = query.eq("order_source", source);

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, source]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}