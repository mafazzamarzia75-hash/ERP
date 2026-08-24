"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(activeOnly = true): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from("products").select("*");
      if (activeOnly) query = query.eq("is_active", true);
      const { data, error } = await query.order("name");
      if (error) throw error;
      setProducts(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, activeOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}