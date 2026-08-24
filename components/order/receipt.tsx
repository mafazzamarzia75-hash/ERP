"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CartItem, Order } from "@/types";

interface ReceiptProps {
  order: Order;
  items: CartItem[];
}

export function Receipt({ order, items }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-xs rounded-lg border p-4 font-mono text-xs">
        {/* Header Nota */}
        <div className="text-center border-b border-dashed pb-3">
          <p className="font-bold text-sm">SANVINAL STORE</p>
          <p className="text-gray-500">Jl. Contoh No. 123, Jakarta</p>
          <p className="text-gray-500">Telp: 021-1234-5678</p>
        </div>

        <div className="border-b border-dashed py-3 space-y-1">
          <p>No. {order.id.slice(0, 8).toUpperCase()}</p>
          <p>
            {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: id })}
          </p>
          <p>Sumber: {order.order_source.toUpperCase()}</p>
        </div>

        {/* Item */}
        <div className="border-b border-dashed py-3 space-y-1.5">
          {items.map((item) => (
            <div key={item.product_id} className="space-y-0.5">
              <p>{item.product_name}</p>
              <div className="flex justify-between text-gray-600">
                <span>
                  {item.quantity} x {formatRupiah(item.price_at_transaction)}
                </span>
                <span>{formatRupiah(item.price_at_transaction * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="py-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatRupiah(order.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bayar</span>
            <span>{formatRupiah(order.cash_tendered)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali</span>
            <span>{formatRupiah(order.cash_change)}</span>
          </div>
        </div>

        <div className="text-center border-t border-dashed pt-3">
          <p>Terima kasih!</p>
          <p className="text-gray-400">Barang yang sudah dibeli tidak dapat dikembalikan</p>
        </div>
      </div>

      <div className="flex justify-center print:hidden">
        <Button onClick={handlePrint}>Cetak Nota</Button>
      </div>
    </div>
  );
}