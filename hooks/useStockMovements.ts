"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StockMovement } from "@/types";

interface UseStockMovementsReturn {
  movements: StockMovement[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStockMovements(productId?: string): UseStockMovementsReturn {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (productId) query = query.eq("product_id", productId);

      const { data, error } = await query;
      if (error) throw error;
      setMovements(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat mutasi stok");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, productId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, isLoading, error, refetch: fetchMovements };
}