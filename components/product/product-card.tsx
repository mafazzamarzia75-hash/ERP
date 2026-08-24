"use client";

import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { Plus } from "lucide-react";
import { StockBadge } from "./stock-badge";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  disabled?: boolean;
}

export function ProductCard({ product, onAddToCart, disabled }: ProductCardProps) {
  const isOutOfStock = product.stock_current <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl font-bold text-gray-400">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
          <StockBadge stock={product.stock_current} minStock={product.stock_min} />
        </div>

        <p className="text-xs text-gray-500">{product.sku}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-primary">
            {formatRupiah(product.price_sell)}
          </span>
          <Button
            size="sm"
            disabled={disabled || isOutOfStock}
            onClick={() => onAddToCart?.(product)}
          >
            <Plus className="h-4 w-4" />
            {isOutOfStock ? "Habis" : "Tambah"}
          </Button>
        </div>
      </div>
    </div>
  );
}