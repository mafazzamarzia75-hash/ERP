"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStock = products.filter(
    (p) => p.stock_current <= p.stock_min && p.is_active
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Alert Stok Menipis</h3>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          {lowStock.length}
        </span>
      </div>

      {lowStock.length === 0 ? (
        <p className="text-sm text-gray-400">Semua stok aman.</p>
      ) : (
        <ul className="space-y-2">
          {lowStock.slice(0, 5).map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">
                  {product.stock_current} tersisa
                </p>
                <p className="text-xs text-gray-400">
                  {formatRupiah(product.price_sell)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}