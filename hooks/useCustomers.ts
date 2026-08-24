"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/types";

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pelanggan");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, isLoading, error, refetch: fetchCustomers };
}