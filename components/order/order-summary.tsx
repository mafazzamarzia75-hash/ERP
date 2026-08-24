"use client";

import { CartItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_transaction * item.quantity,
    0
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Ringkasan Pesanan</h3>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">Keranjang kosong</p>
        ) : (
          items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span>{item.product_name}</span>
                <span className="ml-2 text-gray-400">x{item.quantity}</span>
              </div>
              <span className="font-medium">
                {formatRupiah(item.price_at_transaction * item.quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}