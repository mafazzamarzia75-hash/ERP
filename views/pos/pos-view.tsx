"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/product/product-grid";
import { OrderSummary } from "@/components/order/order-summary";
import { PaymentPanel } from "@/components/order/payment-panel";
import { Receipt } from "@/components/order/receipt";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Product, Order } from "@/types";

export function PosView() {
  const { products, isLoading } = useProducts(true);
  const { items, totalAmount, totalItems, addItem, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "tempo">("cash");
  const [cashTendered, setCashTendered] = useState(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [lastItems, setLastItems] = useState<typeof items>([]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleSubmitPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_source: "pos",
          payment_type: paymentType,
          cash_tendered: cashTendered,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pembayaran gagal");
      }

      const result = await response.json();
      setLastOrder(result.data);
      setLastItems(items);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err) {
      console.error("Pembayaran gagal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kasir (POS)</h1>
          <p className="text-sm text-gray-500">Transaksi langsung di toko</p>
        </div>
        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={items.length === 0}
        >
          Bayar ({totalItems} item)
        </Button>
      </div>

      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

      <Modal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Pembayaran"
      >
        <div className="space-y-6">
          <OrderSummary items={items} />
          <PaymentPanel
            totalAmount={totalAmount}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            onCashTenderedChange={setCashTendered}
            onSubmit={handleSubmitPayment}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Nota Transaksi"
      >
        {lastOrder ? (
          <Receipt order={lastOrder} items={lastItems} />
        ) : null}
      </Modal>
    </div>
  );
}