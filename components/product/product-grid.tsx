"use client";

import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { Spinner } from "@/components/ui/spinner";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium text-gray-600">Tidak ada produk</p>
        <p className="text-sm text-gray-400">
          Produk akan muncul setelah admin menambahkannya.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}